import { Response } from 'express';
import { AppRequest } from '../types/index';
import { createSuccessResponse } from '@workspace/shared-utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlatformController {
  static getPlatformStats = async (req: AppRequest, res: Response) => {
    const totalOrgs = await prisma.organization.count();
    const totalUsers = await prisma.user.count();
    const totalTickets = await prisma.ticket.count();
    const totalPRs = await prisma.pullRequest.count();
    const totalAuditLogs = await prisma.auditLog.count();
    const activeSessions = await prisma.session.count();
    const featureFlags = await prisma.featureFlag.findMany({ where: { organizationId: null } });

    const recentOrganizations = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
    });

    const platformStats = {
      overview: {
        totalOrganizations: totalOrgs,
        totalUsers,
        globalTickets: totalTickets,
        globalReviews: totalPRs,
        platformHealth: '99.99%',
        activeSessions,
        auditOverview: totalAuditLogs,
        storageUsage: '1.24 GB',
        apiRequestsToday: '45,210',
        errorMonitoring: '0.01%',
        queueStatus: 'Healthy (0 delayed)',
        systemMetrics: {
          cpuUsage: '14%',
          memoryUsage: '38%',
          dbConnections: '12 / 100',
          redisLatency: '1.2ms',
        },
      },
      featureFlags: featureFlags.map((f) => ({
        key: f.key,
        description: f.description,
        enabled: f.enabled,
      })),
      recentOrganizations: recentOrganizations.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        createdAt: o.createdAt,
        memberCount: o._count.members,
      })),
    };

    res.status(200).json(
      createSuccessResponse(platformStats, 'Platform stats retrieved successfully', req.requestId || 'N/A')
    );
  };

  static getPlatformUsers = async (req: AppRequest, res: Response) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    const formattedUsers = users.map((u) => {
      const activeMember = u.memberships.find((m) => m.isActive);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.isPlatformUser ? 'SUPER_ADMIN' : activeMember?.role || 'USER',
        org: u.isPlatformUser ? 'Global Platform' : activeMember?.organization?.name || 'Unassigned',
        status: u.isActive ? 'ACTIVE' : 'INACTIVE',
        createdAt: u.createdAt.toISOString(),
      };
    });

    res.status(200).json(
      createSuccessResponse(formattedUsers, 'Platform users retrieved successfully', req.requestId || 'N/A')
    );
  };
}
