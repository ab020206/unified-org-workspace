import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import {
  AuditAnalyticsQueryDto,
  AuditAnalyticsSummaryDto,
  AnomalyAlertDto,
} from '@workspace/shared-types';
import { AnomalySeverity, Role } from '@prisma/client';

export class AuditAnalyticsService {
  async getAnalyticsSummary(
    query: AuditAnalyticsQueryDto,
    scopedOrgId?: string | null,
    userRole: string = Role.ADMIN
  ): Promise<AuditAnalyticsSummaryDto> {
    // RBAC check: SUPPORT_AGENT & GUEST cannot view audit analytics
    if (userRole === Role.SUPPORT_AGENT || userRole === Role.GUEST) {
      throw ApiError.forbidden('Insufficient permissions to view audit analytics');
    }

    const where: any = {};

    // Scope to active organization for non-super-admins
    if (userRole !== Role.SUPER_ADMIN && scopedOrgId) {
      where.organizationId = scopedOrgId;
    } else if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.userId) where.actorId = query.userId;
    if (query.role) where.actorRole = query.role;
    if (query.actionType) where.action = { contains: query.actionType, mode: 'insensitive' };
    if (query.entityType) where.entityType = query.entityType;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [
      totalLogins,
      orgsCreated,
      usersCreated,
      ticketsCreated,
      reviewsCreated,
      reviewsApproved,
      reviewsRejected,
      featureFlagChanges,
      permissionChanges,
      actionGroups,
      actorGroups,
      logsForTimeline,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: { ...where, action: { in: ['LOGIN_SUCCESS', 'USER_LOGIN'] } },
      }),
      prisma.auditLog.count({ where: { ...where, action: 'ORG_CREATED' } }),
      prisma.auditLog.count({
        where: { ...where, action: { in: ['USER_REGISTERED', 'USER_CREATED', 'MEMBER_ADDED'] } },
      }),
      prisma.auditLog.count({ where: { ...where, action: 'TICKET_CREATED' } }),
      prisma.auditLog.count({ where: { ...where, action: 'PR_CREATED' } }),
      prisma.auditLog.count({
        where: { ...where, action: { in: ['DECISION_APPROVED', 'PR_APPROVED'] } },
      }),
      prisma.auditLog.count({
        where: { ...where, action: { in: ['DECISION_REJECTED', 'PR_REJECTED'] } },
      }),
      prisma.auditLog.count({ where: { ...where, module: 'FEATURE_FLAGS' } }),
      prisma.auditLog.count({
        where: { ...where, action: { in: ['PERMISSION_OVERRIDE_UPDATED', 'MEMBER_ROLE_UPDATED'] } },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 5,
      }),
      prisma.auditLog.groupBy({
        by: ['actorId', 'actorEmail'],
        where,
        _count: { actorId: true },
        orderBy: { _count: { actorId: 'desc' } },
        take: 5,
      }),
      prisma.auditLog.findMany({
        where,
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
        take: 1000,
      }),
    ]);

    // Timeline Aggregation (Daily)
    const timelineMap = new Map<string, number>();
    for (const log of logsForTimeline) {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
    }
    const activityTimeline = Array.from(timelineMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Most Active Users & Actions
    const mostActiveUsers = actorGroups.map((g) => ({
      userId: g.actorId,
      email: g.actorEmail,
      actionCount: g._count.actorId,
    }));

    const mostFrequentActions = actionGroups.map((g) => ({
      action: g.action,
      count: g._count.action,
    }));

    // Action Distribution by Category
    const actionDistribution = [
      { category: 'Authentication & Security', count: totalLogins + permissionChanges },
      { category: 'Tickets & Support', count: ticketsCreated },
      { category: 'Code Reviews', count: reviewsCreated + reviewsApproved + reviewsRejected },
      { category: 'Organization & Users', count: orgsCreated + usersCreated },
      { category: 'Feature Flags', count: featureFlagChanges },
    ];

    return {
      totalLogins,
      orgsCreated,
      usersCreated,
      ticketsCreated,
      reviewsCreated,
      reviewsApproved,
      reviewsRejected,
      featureFlagChanges,
      permissionChanges,
      mostActiveUsers,
      mostActiveOrgs: [],
      mostFrequentActions,
      activityTimeline,
      actionDistribution,
    };
  }

  async runAnomalyDetection(scopedOrgId?: string | null): Promise<AnomalyAlertDto[]> {
    const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); // Past 24h
    const where: any = { createdAt: { gte: timeWindow } };
    if (scopedOrgId) where.organizationId = scopedOrgId;

    // Rule 1: High volume of failed logins
    const failedLogins = await prisma.auditLog.count({
      where: { ...where, action: { in: ['LOGIN_FAILED', 'INVALID_CREDENTIALS'] } },
    });

    if (failedLogins >= 5) {
      await this.flagAnomaly({
        organizationId: scopedOrgId,
        type: 'FAILED_LOGINS_SPIKE',
        severity: 'HIGH',
        title: 'Spike in Failed Login Attempts',
        description: `Detected ${failedLogins} failed login attempts in the past 24 hours.`,
        metadata: { count: failedLogins },
      });
    }

    // Rule 2: Permission Overrides or Role Changes
    const permChanges = await prisma.auditLog.count({
      where: { ...where, action: { in: ['PERMISSION_OVERRIDE_UPDATED', 'MEMBER_ROLE_UPDATED'] } },
    });

    if (permChanges >= 3) {
      await this.flagAnomaly({
        organizationId: scopedOrgId,
        type: 'PERMISSION_CHANGES_SPIKE',
        severity: 'CRITICAL',
        title: 'Multiple Permission Escalations',
        description: `Detected ${permChanges} permission override or role modification events.`,
        metadata: { count: permChanges },
      });
    }

    // Rule 3: Mass Deletions
    const deletions = await prisma.auditLog.count({
      where: { ...where, action: { contains: 'DELETE', mode: 'insensitive' } },
    });

    if (deletions >= 5) {
      await this.flagAnomaly({
        organizationId: scopedOrgId,
        type: 'MASS_DELETIONS_DETECTED',
        severity: 'HIGH',
        title: 'Unusually High Deletion Count',
        description: `Detected ${deletions} resource deletion operations in the past 24 hours.`,
        metadata: { count: deletions },
      });
    }

    // Fetch active alerts
    return this.getAnomalies(scopedOrgId);
  }

  private async flagAnomaly(data: {
    organizationId?: string | null;
    type: string;
    severity: AnomalySeverity;
    title: string;
    description: string;
    metadata?: any;
  }) {
    // Avoid duplicate unacknowledged alert of same type within 1 hour
    const existing = await prisma.anomalyAlert.findFirst({
      where: {
        organizationId: data.organizationId || null,
        type: data.type,
        acknowledged: false,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (existing) return existing;

    logger.warn({ data }, '[AnomalyDetection] Security anomaly flagged');

    return prisma.anomalyAlert.create({
      data: {
        organizationId: data.organizationId || null,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        metadata: data.metadata || null,
      },
    });
  }

  async getAnomalies(scopedOrgId?: string | null): Promise<AnomalyAlertDto[]> {
    const where: any = {};
    if (scopedOrgId) where.organizationId = scopedOrgId;

    return prisma.anomalyAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    }) as any;
  }

  async acknowledgeAnomaly(alertId: string, userId: string, scopedOrgId?: string | null) {
    const alert = await prisma.anomalyAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) throw ApiError.notFound('Anomaly alert not found');
    if (scopedOrgId && alert.organizationId && alert.organizationId !== scopedOrgId) {
      throw ApiError.forbidden('Cannot acknowledge alert from another organization');
    }

    return prisma.anomalyAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });
  }
}

export const auditAnalyticsService = new AuditAnalyticsService();
