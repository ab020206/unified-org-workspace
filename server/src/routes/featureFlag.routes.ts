import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { FeatureFlagController } from '../controllers/featureFlag.controller';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { requireRole } from '../middleware/authorize';
import { Role } from '@workspace/shared-types';

const router = Router();
const controller = new FeatureFlagController();

router.use(authenticate);
router.use(tenantContext);

router.get('/', asyncHandler(controller.getFeatureFlags));
router.patch(
  '/:key',
  requireRole([Role.SUPER_ADMIN, Role.ADMIN]),
  asyncHandler(controller.toggleFeatureFlag)
);

export default router;
