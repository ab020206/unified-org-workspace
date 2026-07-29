import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { AuditController } from '../controllers/audit.controller';
import { Permission } from '@workspace/shared-types';

import * as auditAnalyticsController from '../controllers/auditAnalytics.controller';

export const auditRouter = Router();

// Apply auth, tenant resolution, and permission resolution middleware
auditRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

// Advanced Audit Analytics & Anomaly Detection Routes
auditRouter.get(
  '/analytics',
  requirePermission([Permission.AUDIT_ANALYTICS_READ]),
  auditAnalyticsController.getAnalytics
);

auditRouter.get(
  '/anomalies',
  requirePermission([Permission.AUDIT_ANALYTICS_READ]),
  auditAnalyticsController.getAnomalies
);

auditRouter.post(
  '/anomalies/:id/acknowledge',
  requirePermission([Permission.ANOMALY_ACKNOWLEDGE]),
  auditAnalyticsController.acknowledgeAnomaly
);

auditRouter.get(
  '/ai-insights',
  requirePermission([Permission.AUDIT_ANALYTICS_READ]),
  auditAnalyticsController.getAIInsights
);

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
