import { CollaborationRepository } from '../repositories/collaboration.repository';
import { OrganizationRepository } from '../repositories/organization.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { PullRequestRepository } from '../repositories/pullRequest.repository';
import { UserRepository } from '../repositories/user.repository';
import { auditService } from './audit.service';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import {
  OrganizationConnectionStatus,
  SharedResourceType,
  SharePermission,
  CreateShareDto,
  UpdateShareDto,
} from '@workspace/shared-types';

export class CollaborationService {
  private collabRepo: CollaborationRepository;
  private orgRepo: OrganizationRepository;
  private ticketRepo: TicketRepository;
  private prRepo: PullRequestRepository;
  private userRepo: UserRepository;

  constructor() {
    this.collabRepo = new CollaborationRepository();
    this.orgRepo = new OrganizationRepository();
    this.ticketRepo = new TicketRepository();
    this.prRepo = new PullRequestRepository();
    this.userRepo = new UserRepository();
  }

  async requestConnection(sourceOrgId: string, currentUserId: string, targetOrgIdOrSlug: string) {
    let targetOrg = await this.orgRepo.findById(targetOrgIdOrSlug);
    if (!targetOrg) {
      targetOrg = await this.orgRepo.findBySlug(targetOrgIdOrSlug);
    }
    if (!targetOrg) {
      throw ApiError.notFound('Target organization not found by ID or slug');
    }

    if (targetOrg.id === sourceOrgId) {
      throw ApiError.badRequest('Cannot establish a connection with your own organization');
    }

    const existing = await this.collabRepo.findConnectionBetweenOrgs(sourceOrgId, targetOrg.id);
    if (existing) {
      if (existing.status === OrganizationConnectionStatus.ACCEPTED) {
        throw ApiError.conflict('An active connection already exists between these organizations');
      }
      if (existing.status === OrganizationConnectionStatus.PENDING) {
        throw ApiError.conflict(
          'A connection request is already pending between these organizations'
        );
      }
    }

    const connection = await this.collabRepo.createConnection({
      sourceOrganizationId: sourceOrgId,
      targetOrganizationId: targetOrg.id,
      requestedBy: currentUserId,
    });

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: sourceOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'ORGANIZATION',
      action: 'CONNECTION_REQUESTED',
      entityType: 'ORGANIZATION_CONNECTION',
      entityId: connection.id,
      newState: { sourceOrgId, targetOrgId: targetOrg.id, status: connection.status },
    });

    logger.info(
      { connectionId: connection.id, sourceOrgId, targetOrgId: targetOrg.id },
      'Connection requested'
    );
    return connection;
  }

  async acceptConnection(connectionId: string, currentOrgId: string, currentUserId: string) {
    const connection = await this.collabRepo.findConnectionById(connectionId);
    if (!connection) {
      throw ApiError.notFound('Connection request not found');
    }

    if (connection.targetOrganizationId !== currentOrgId) {
      throw ApiError.forbidden('Only the target organization can accept this connection request');
    }

    if (connection.status !== OrganizationConnectionStatus.PENDING) {
      throw ApiError.badRequest(`Cannot accept connection with status '${connection.status}'`);
    }

    const updated = await this.collabRepo.updateConnectionStatus(
      connectionId,
      OrganizationConnectionStatus.ACCEPTED,
      currentUserId
    );

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: currentOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'ORGANIZATION',
      action: 'CONNECTION_ACCEPTED',
      entityType: 'ORGANIZATION_CONNECTION',
      entityId: connection.id,
      newState: { status: 'ACCEPTED' },
    });

    return updated;
  }

  async rejectConnection(connectionId: string, currentOrgId: string, currentUserId: string) {
    const connection = await this.collabRepo.findConnectionById(connectionId);
    if (!connection || connection.targetOrganizationId !== currentOrgId) {
      throw ApiError.notFound('Connection request not found');
    }

    const updated = await this.collabRepo.updateConnectionStatus(
      connectionId,
      OrganizationConnectionStatus.REJECTED
    );

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: currentOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'ORGANIZATION',
      action: 'CONNECTION_REJECTED',
      entityType: 'ORGANIZATION_CONNECTION',
      entityId: connection.id,
    });

    return updated;
  }

  async disconnect(connectionId: string, currentOrgId: string, currentUserId: string) {
    const connection = await this.collabRepo.findConnectionById(connectionId);
    if (
      !connection ||
      (connection.sourceOrganizationId !== currentOrgId &&
        connection.targetOrganizationId !== currentOrgId)
    ) {
      throw ApiError.notFound('Connection not found');
    }

    await this.collabRepo.updateConnectionStatus(
      connectionId,
      OrganizationConnectionStatus.REVOKED
    );

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: currentOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'ORGANIZATION',
      action: 'CONNECTION_REVOKED',
      entityType: 'ORGANIZATION_CONNECTION',
      entityId: connection.id,
    });

    return { success: true, message: 'Connection revoked successfully' };
  }

  async listConnections(currentOrgId: string) {
    return this.collabRepo.listConnections(currentOrgId);
  }

  async shareResource(ownerOrgId: string, currentUserId: string, dto: CreateShareDto) {
    // 1. Verify resource exists in caller's active organization
    let resourceTitle = '';
    if (dto.resourceType === SharedResourceType.TICKET) {
      const ticket = await this.ticketRepo.findTicketById(ownerOrgId, dto.resourceId);
      if (!ticket) {
        throw ApiError.notFound('Ticket not found in your organization');
      }
      resourceTitle = ticket.title;
    } else if (dto.resourceType === SharedResourceType.PULL_REQUEST) {
      const pr = await this.prRepo.findPullRequestById(ownerOrgId, dto.resourceId);
      if (!pr) {
        throw ApiError.notFound('Pull Request not found in your organization');
      }
      resourceTitle = pr.title;
    }

    // 2. Verify an ACCEPTED connection exists between ownerOrgId and targetOrganizationId
    const connection = await this.collabRepo.findConnectionBetweenOrgs(
      ownerOrgId,
      dto.targetOrganizationId
    );
    if (!connection || connection.status !== OrganizationConnectionStatus.ACCEPTED) {
      throw ApiError.badRequest(
        'Must establish an accepted connection before sharing resources with this organization'
      );
    }

    // 3. Create Share Record
    const expiresAtDate = dto.expiresAt ? new Date(dto.expiresAt) : null;
    const share = await this.collabRepo.createShare({
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      ownerOrganizationId: ownerOrgId,
      sharedWithOrganizationId: dto.targetOrganizationId,
      permission: dto.permission || SharePermission.READ,
      expiresAt: expiresAtDate,
      sharedBy: currentUserId,
    });

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: ownerOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: dto.resourceType === SharedResourceType.TICKET ? 'SUPPORT_HUB' : 'REVIEW_CONSOLE',
      action: 'RESOURCE_SHARED',
      entityType: dto.resourceType,
      entityId: dto.resourceId,
      newState: {
        shareId: share.id,
        sharedWithOrganizationId: dto.targetOrganizationId,
        permission: share.permission,
        expiresAt: share.expiresAt,
        title: resourceTitle,
      },
    });

    logger.info(
      { shareId: share.id, ownerOrgId, targetOrgId: dto.targetOrganizationId },
      'Resource Shared'
    );

    const { notificationService } = await import('./notification.service');
    const { NotificationType } = await import('@workspace/shared-types');
    const { prisma } = await import('../config/prisma');
    const targetOrgMembers = await prisma.organizationMember.findMany({
      where: { organizationId: dto.targetOrganizationId },
    });
    if (targetOrgMembers.length > 0) {
      await notificationService.sendNotification({
        userId: targetOrgMembers[0].userId,
        organizationId: dto.targetOrganizationId,
        type: NotificationType.SHARE_RECEIVED,
        title: '🔗 New Resource Shared with Your Org',
        message: `A ${dto.resourceType} "${resourceTitle}" has been shared with your organization.`,
        referenceType: dto.resourceType,
        referenceId: dto.resourceId,
      });
    }

    return share;
  }

  async updateShare(
    ownerOrgId: string,
    currentUserId: string,
    shareId: string,
    dto: UpdateShareDto
  ) {
    const share = await this.collabRepo.findShareById(shareId);
    if (!share || share.ownerOrganizationId !== ownerOrgId) {
      throw ApiError.notFound('Shared resource record not found');
    }

    const updateData: any = {};
    if (dto.permission) updateData.permission = dto.permission;
    if (dto.expiresAt !== undefined) {
      updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    const updated = await this.collabRepo.updateShare(shareId, updateData);

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: ownerOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: share.resourceType === SharedResourceType.TICKET ? 'SUPPORT_HUB' : 'REVIEW_CONSOLE',
      action: 'SHARE_UPDATED',
      entityType: share.resourceType,
      entityId: share.resourceId,
      previousState: { permission: share.permission, expiresAt: share.expiresAt },
      newState: { permission: updated.permission, expiresAt: updated.expiresAt },
    });

    return updated;
  }

  async revokeShare(ownerOrgId: string, currentUserId: string, shareId: string) {
    const share = await this.collabRepo.findShareById(shareId);
    if (!share || share.ownerOrganizationId !== ownerOrgId) {
      throw ApiError.notFound('Shared resource record not found');
    }

    await this.collabRepo.deleteShare(shareId);

    const user = await this.userRepo.findById(currentUserId);

    await auditService.log({
      organizationId: ownerOrgId,
      actorId: currentUserId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: share.resourceType === SharedResourceType.TICKET ? 'SUPPORT_HUB' : 'REVIEW_CONSOLE',
      action: 'SHARE_REVOKED',
      entityType: share.resourceType,
      entityId: share.resourceId,
    });

    return { success: true, message: 'Resource share revoked successfully' };
  }

  async getSharedDashboard(currentOrgId: string) {
    const { incomingShares, outgoingShares } = await this.collabRepo.listShares(currentOrgId);
    const connections = await this.collabRepo.listConnections(currentOrgId);

    const activeConnections = connections.filter(
      (c) => c.status === OrganizationConnectionStatus.ACCEPTED
    );
    const pendingRequests = connections.filter(
      (c) =>
        c.status === OrganizationConnectionStatus.PENDING && c.targetOrganizationId === currentOrgId
    );

    // Populate resourceDetails (ticket/PR titles) for UI dashboard display
    const enrichShare = async (s: any) => {
      let details: any = null;
      if (s.resourceType === SharedResourceType.TICKET) {
        details = await this.ticketRepo.findTicketById(s.ownerOrganizationId, s.resourceId);
      } else if (s.resourceType === SharedResourceType.PULL_REQUEST) {
        details = await this.prRepo.findPullRequestById(s.ownerOrganizationId, s.resourceId);
      }
      return {
        ...s,
        resourceDetails: details ? { title: details.title, status: details.status } : null,
      };
    };

    const enrichedIncoming = await Promise.all(incomingShares.map(enrichShare));
    const enrichedOutgoing = await Promise.all(outgoingShares.map(enrichShare));

    return {
      incomingShares: enrichedIncoming,
      outgoingShares: enrichedOutgoing,
      connections: activeConnections,
      pendingRequests,
    };
  }

  async getSharedResourceAccess(
    currentOrgId: string,
    currentUserId: string,
    resourceType: SharedResourceType,
    resourceId: string
  ) {
    const share = await this.collabRepo.findActiveShareForResource(
      resourceType,
      resourceId,
      currentOrgId
    );
    if (!share) return null;

    // Record guest access log
    await this.collabRepo.recordAccess(
      share.id,
      currentUserId,
      share.permission as SharePermission
    );

    return share;
  }
}
