import { prisma } from '../config/prisma';
import {
  OrganizationConnectionStatus,
  SharedResourceType,
  SharePermission,
} from '@workspace/shared-types';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
};

const orgSelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
};

export class CollaborationRepository {
  async createConnection(data: {
    sourceOrganizationId: string;
    targetOrganizationId: string;
    requestedBy: string;
  }) {
    return prisma.organizationConnection.create({
      data: {
        sourceOrganizationId: data.sourceOrganizationId,
        targetOrganizationId: data.targetOrganizationId,
        requestedBy: data.requestedBy,
        status: OrganizationConnectionStatus.PENDING,
      },
      include: {
        sourceOrg: { select: orgSelect },
        targetOrg: { select: orgSelect },
        requester: { select: userSelect },
      },
    });
  }

  async findConnectionById(connectionId: string) {
    return prisma.organizationConnection.findUnique({
      where: { id: connectionId },
      include: {
        sourceOrg: { select: orgSelect },
        targetOrg: { select: orgSelect },
        requester: { select: userSelect },
        approver: { select: userSelect },
      },
    });
  }

  async findConnectionBetweenOrgs(orgIdA: string, orgIdB: string) {
    return prisma.organizationConnection.findFirst({
      where: {
        OR: [
          { sourceOrganizationId: orgIdA, targetOrganizationId: orgIdB },
          { sourceOrganizationId: orgIdB, targetOrganizationId: orgIdA },
        ],
      },
      include: {
        sourceOrg: { select: orgSelect },
        targetOrg: { select: orgSelect },
        requester: { select: userSelect },
        approver: { select: userSelect },
      },
    });
  }

  async updateConnectionStatus(
    connectionId: string,
    status: OrganizationConnectionStatus,
    approvedBy?: string
  ) {
    return prisma.organizationConnection.update({
      where: { id: connectionId },
      data: {
        status,
        approvedBy: approvedBy || undefined,
        approvedAt: status === OrganizationConnectionStatus.ACCEPTED ? new Date() : undefined,
      },
      include: {
        sourceOrg: { select: orgSelect },
        targetOrg: { select: orgSelect },
        requester: { select: userSelect },
        approver: { select: userSelect },
      },
    });
  }

  async deleteConnection(connectionId: string) {
    await prisma.organizationConnection.delete({ where: { id: connectionId } });
    return true;
  }

  async listConnections(organizationId: string) {
    return prisma.organizationConnection.findMany({
      where: {
        OR: [{ sourceOrganizationId: organizationId }, { targetOrganizationId: organizationId }],
      },
      include: {
        sourceOrg: { select: orgSelect },
        targetOrg: { select: orgSelect },
        requester: { select: userSelect },
        approver: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createShare(data: {
    resourceType: SharedResourceType;
    resourceId: string;
    ownerOrganizationId: string;
    sharedWithOrganizationId: string;
    permission: SharePermission;
    expiresAt?: Date | null;
    sharedBy: string;
  }) {
    return prisma.sharedResource.upsert({
      where: {
        resourceType_resourceId_sharedWithOrganizationId: {
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          sharedWithOrganizationId: data.sharedWithOrganizationId,
        },
      },
      update: {
        permission: data.permission,
        expiresAt: data.expiresAt || null,
        sharedBy: data.sharedBy,
      },
      create: {
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ownerOrganizationId: data.ownerOrganizationId,
        sharedWithOrganizationId: data.sharedWithOrganizationId,
        permission: data.permission,
        expiresAt: data.expiresAt || null,
        sharedBy: data.sharedBy,
      },
      include: {
        ownerOrg: { select: orgSelect },
        sharedWithOrg: { select: orgSelect },
        sharer: { select: userSelect },
      },
    });
  }

  async findShareById(shareId: string) {
    return prisma.sharedResource.findUnique({
      where: { id: shareId },
      include: {
        ownerOrg: { select: orgSelect },
        sharedWithOrg: { select: orgSelect },
        sharer: { select: userSelect },
      },
    });
  }

  async findActiveShareForResource(
    resourceType: SharedResourceType,
    resourceId: string,
    sharedWithOrganizationId: string
  ) {
    const share = await prisma.sharedResource.findFirst({
      where: {
        resourceType,
        resourceId,
        sharedWithOrganizationId,
      },
      include: {
        ownerOrg: { select: orgSelect },
        sharedWithOrg: { select: orgSelect },
        sharer: { select: userSelect },
      },
    });

    if (!share) return null;
    if (share.expiresAt && share.expiresAt < new Date()) {
      return null; // Expired share
    }
    return share;
  }

  async updateShare(
    shareId: string,
    data: { permission?: SharePermission; expiresAt?: Date | null }
  ) {
    return prisma.sharedResource.update({
      where: { id: shareId },
      data,
      include: {
        ownerOrg: { select: orgSelect },
        sharedWithOrg: { select: orgSelect },
        sharer: { select: userSelect },
      },
    });
  }

  async deleteShare(shareId: string) {
    await prisma.sharedResource.delete({ where: { id: shareId } });
    return true;
  }

  async listShares(organizationId: string) {
    const now = new Date();
    const [incomingShares, outgoingShares] = await Promise.all([
      prisma.sharedResource.findMany({
        where: {
          sharedWithOrganizationId: organizationId,
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
        include: {
          ownerOrg: { select: orgSelect },
          sharedWithOrg: { select: orgSelect },
          sharer: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sharedResource.findMany({
        where: {
          ownerOrganizationId: organizationId,
        },
        include: {
          ownerOrg: { select: orgSelect },
          sharedWithOrg: { select: orgSelect },
          sharer: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { incomingShares, outgoingShares };
  }

  async recordAccess(sharedResourceId: string, guestUserId: string, permission: SharePermission) {
    return prisma.sharedAccess.create({
      data: {
        sharedResourceId,
        guestUserId,
        permission,
        lastAccessedAt: new Date(),
      },
    });
  }
}
