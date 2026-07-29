import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { DigestController } from '../controllers/digest.controller';
import { Permission } from '@workspace/shared-types';

export const digestRouter = Router();

digestRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

digestRouter.get(
  '/',
  requirePermission(Permission.ORG_READ),
  asyncHandler(DigestController.getLatestDigest)
);

digestRouter.post(
  '/generate',
  requirePermission(Permission.ORG_READ),
  asyncHandler(DigestController.triggerGenerate)
);

digestRouter.get(
  '/history',
  requirePermission(Permission.ORG_READ),
  asyncHandler(DigestController.getHistory)
);
