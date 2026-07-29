import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { AuditController } from '../controllers/audit.controller';
import { Permission } from '@workspace/shared-types';

export const auditRouter = Router();

// Apply auth, tenant resolution, and permission resolution middleware
auditRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

// Dashboard Stats & Lists
auditRouter.get(
  '/stats',
  requirePermission(Permission.AUDIT_READ),
  asyncHandler(AuditController.getDashboardStats)
);

auditRouter.get(
  '/modules',
  requirePermission(Permission.AUDIT_READ),
  asyncHandler(AuditController.getDistinctModules)
);

auditRouter.get(
  '/actions',
  requirePermission(Permission.AUDIT_READ),
  asyncHandler(AuditController.getDistinctActions)
);

auditRouter.get(
  '/',
  requirePermission(Permission.AUDIT_READ),
  asyncHandler(AuditController.getAuditLogs)
);

auditRouter.get(
  '/:id',
  requirePermission(Permission.AUDIT_READ),
  asyncHandler(AuditController.getAuditLogById)
);
