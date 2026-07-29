import { AuditRepository } from '@/src/repositories/audit.repository';

const auditRepo = new AuditRepository();

export async function logSecurityEvent(params: {
  userId?: string;
  organizationId?: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    return await auditRepo.createLog({
      actorId: params.userId || 'SYSTEM',
      actorEmail: 'system@froncort.ai',
      actorRole: 'SYSTEM',
      organizationId: params.organizationId,
      module: 'SECURITY',
      action: params.eventType,
      entityType: 'SECURITY_EVENT',
      entityId: params.userId || 'SYSTEM',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: [
        { key: 'severity', value: params.severity },
        { key: 'details', value: JSON.stringify(params.details || {}) },
      ],
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
