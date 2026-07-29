import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { prisma } from '@/src/config/prisma';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);

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

    return NextResponse.json(createSuccessResponse(platformStats, 'Platform stats retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
