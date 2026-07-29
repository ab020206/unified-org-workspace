import { AuditRepository } from '../repositories/audit.repository';
import { logger } from '../utils/logger';
import { AuditListQueryDto } from '@workspace/shared-types';

export interface LogAuditEventInput {
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
}

export class AuditService {
  private repo: AuditRepository;

  constructor() {
    this.repo = new AuditRepository();
  }

  async log(event: LogAuditEventInput): Promise<void> {
    try {
      // Prevent recursive audit log loops
      if (event.module === 'AUDIT_LOGGING') return;

      await this.repo.createLog({
        organizationId: event.organizationId || null,
        actorId: event.actorId,
        actorEmail: event.actorEmail,
        actorRole: event.actorRole,
        module: event.module,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        previousState: event.previousState,
        newState: event.newState,
        ipAddress: event.ipAddress || null,
        userAgent: event.userAgent || null,
        requestId: event.requestId || null,
        metadata: event.metadata,
      });
    } catch (err: any) {
      // Audit logging should never break the caller business operation
      logger.error({ error: err.message, event }, 'Failed to record audit event');
    }
  }

  async getLogs(query: AuditListQueryDto, scopedOrgId?: string | null, isSuperAdmin = false) {
    return this.repo.findLogs(query, scopedOrgId, isSuperAdmin);
  }

  async getLogById(id: string, scopedOrgId?: string | null, isSuperAdmin = false) {
    return this.repo.findLogById(id, scopedOrgId, isSuperAdmin);
  }

  async getDashboardStats(scopedOrgId?: string | null, isSuperAdmin = false) {
    return this.repo.getDashboardStats(scopedOrgId, isSuperAdmin);
  }

  async getModules(scopedOrgId?: string | null, isSuperAdmin = false) {
    return this.repo.getDistinctModules(scopedOrgId, isSuperAdmin);
  }

  async getActions(scopedOrgId?: string | null, isSuperAdmin = false) {
    return this.repo.getDistinctActions(scopedOrgId, isSuperAdmin);
  }
}

export const auditService = new AuditService();
