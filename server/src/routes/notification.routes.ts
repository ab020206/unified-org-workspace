import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { NotificationController } from '../controllers/notification.controller';
import { Permission } from '@workspace/shared-types';

export const notificationRouter = Router();

notificationRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

notificationRouter.get(
  '/',
  requirePermission(Permission.NOTIFICATION_READ),
  asyncHandler(NotificationController.getNotifications)
);

notificationRouter.patch(
  '/read-all',
  requirePermission(Permission.NOTIFICATION_READ),
  asyncHandler(NotificationController.markAllAsRead)
);

notificationRouter.patch(
  '/:id/read',
  requirePermission(Permission.NOTIFICATION_READ),
  asyncHandler(NotificationController.markAsRead)
);

notificationRouter.delete(
  '/:id',
  requirePermission(Permission.NOTIFICATION_READ),
  asyncHandler(NotificationController.deleteNotification)
);
