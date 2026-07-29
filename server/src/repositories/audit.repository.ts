import { prisma } from '../config/prisma';
import { AuditListQueryDto } from '@workspace/shared-types';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
};

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'invitationToken',
];

function sanitizeState(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeState);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(key)) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeState(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class AuditRepository {
  async createLog(data: {
    organizationId?: string | null;
    actorId: string;
    actorEmail: string;
    actorRole: string;
    module: string;
    action: string;
    entityType: string;
    entityId: string;
    previousState?: any;
    newState?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
    metadata?: Array<{ key: string; value: string }>;
  }) {
    const cleanPrev = sanitizeState(data.previousState);
    const cleanNew = sanitizeState(data.newState);

    return prisma.auditLog.create({
      data: {
        organizationId: data.organizationId || null,
        actorId: data.actorId,
        actorEmail: data.actorEmail,
        actorRole: data.actorRole,
        module: data.module,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        previousState: cleanPrev ? JSON.parse(JSON.stringify(cleanPrev)) : null,
        newState: cleanNew ? JSON.parse(JSON.stringify(cleanNew)) : null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        requestId: data.requestId || null,
        metadata:
          data.metadata && data.metadata.length > 0
            ? {
                create: data.metadata,
              }
            : undefined,
      },
      include: {
        actor: { select: userSelect },
        metadata: true,
      },
    });
  }

  async findLogById(logId: string, organizationId?: string | null, isSuperAdmin = false) {
    const where: any = { id: logId };
    if (!isSuperAdmin && organizationId) {
      where.organizationId = organizationId;
    }

    return prisma.auditLog.findFirst({
      where,
      include: {
        actor: { select: userSelect },
        metadata: true,
      },
    });
  }

  async findLogs(query: AuditListQueryDto, scopedOrgId?: string | null, isSuperAdmin = false) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Multi-tenant isolation: Organization users can only view their active organization's logs
    if (!isSuperAdmin) {
      if (scopedOrgId) {
        where.organizationId = scopedOrgId;
      } else {
        where.organizationId = 'non-existent-id';
      }
    } else if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.module) {
      where.module = query.module;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { module: { contains: query.search, mode: 'insensitive' } },
        { entityType: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
        { actorEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          actor: { select: userSelect },
          metadata: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getDashboardStats(scopedOrgId?: string | null, isSuperAdmin = false) {
    const where: any = {};
    if (!isSuperAdmin && scopedOrgId) {
      where.organizationId = scopedOrgId;
    }

    const [totalEvents, authEvents, ticketEvents, reviewEvents, recentActivity] = await Promise.all(
      [
        prisma.auditLog.count({ where }),
        prisma.auditLog.count({ where: { ...where, module: 'AUTHENTICATION' } }),
        prisma.auditLog.count({ where: { ...where, module: 'SUPPORT_HUB' } }),
        prisma.auditLog.count({ where: { ...where, module: 'REVIEW_CONSOLE' } }),
        prisma.auditLog.findMany({
          where,
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: userSelect } },
        }),
      ]
    );

    return {
      totalEvents,
      authEvents,
      ticketEvents,
      reviewEvents,
      recentActivity,
    };
  }

  async getDistinctModules(scopedOrgId?: string | null, isSuperAdmin = false) {
    const where: any = {};
    if (!isSuperAdmin && scopedOrgId) {
      where.organizationId = scopedOrgId;
    }
    const result = await prisma.auditLog.findMany({
      where,
      select: { module: true },
      distinct: ['module'],
    });
    return result.map((r) => r.module);
  }

  async getDistinctActions(scopedOrgId?: string | null, isSuperAdmin = false) {
    const where: any = {};
    if (!isSuperAdmin && scopedOrgId) {
      where.organizationId = scopedOrgId;
    }
    const result = await prisma.auditLog.findMany({
      where,
      select: { action: true },
      distinct: ['action'],
    });
    return result.map((r) => r.action);
  }
}
