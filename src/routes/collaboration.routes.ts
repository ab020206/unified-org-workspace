import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { CollaborationController } from '../controllers/collaboration.controller';
import { Permission } from '@workspace/shared-types';

export const connectionsRouter = Router();
connectionsRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

connectionsRouter.post(
  '/request',
  requirePermission(Permission.SHARE_CREATE),
  asyncHandler(CollaborationController.requestConnection)
);

connectionsRouter.get(
  '/',
  requirePermission(Permission.ORG_READ),
  asyncHandler(CollaborationController.getConnections)
);

connectionsRouter.patch(
  '/:id/accept',
  requirePermission(Permission.SHARE_ACCEPT),
  asyncHandler(CollaborationController.acceptConnection)
);

connectionsRouter.patch(
  '/:id/reject',
  requirePermission(Permission.SHARE_ACCEPT),
  asyncHandler(CollaborationController.rejectConnection)
);

connectionsRouter.delete(
  '/:id',
  requirePermission(Permission.SHARE_CREATE),
  asyncHandler(CollaborationController.disconnect)
);

export const sharingRouter = Router();
sharingRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

sharingRouter.post(
  '/',
  requirePermission(Permission.SHARE_CREATE),
  asyncHandler(CollaborationController.createShare)
);

sharingRouter.get(
  '/',
  requirePermission(Permission.ORG_READ),
  asyncHandler(CollaborationController.getDashboard)
);

sharingRouter.patch(
  '/:id',
  requirePermission(Permission.SHARE_CREATE),
  asyncHandler(CollaborationController.updateShare)
);

sharingRouter.delete(
  '/:id',
  requirePermission(Permission.SHARE_CREATE),
  asyncHandler(CollaborationController.revokeShare)
);

export const sharedFeedRouter = Router();
sharedFeedRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

sharedFeedRouter.get(
  '/resources',
  requirePermission(Permission.ORG_READ),
  asyncHandler(CollaborationController.getDashboard)
);

sharedFeedRouter.get(
  '/tickets',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(CollaborationController.getSharedTickets)
);

sharedFeedRouter.get(
  '/pull-requests',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(CollaborationController.getSharedPullRequests)
);
