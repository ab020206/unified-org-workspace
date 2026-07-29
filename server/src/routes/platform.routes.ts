import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requireRole } from '../middleware/authorize';
import { PlatformController } from '../controllers/platform.controller';
import { Role } from '@workspace/shared-types';

const router = Router();

router.use(authenticate);
router.use(tenantContext);
router.use(resolvePermissions);

router.get('/stats', requireRole(Role.SUPER_ADMIN), PlatformController.getPlatformStats);
router.get('/users', requireRole(Role.SUPER_ADMIN), PlatformController.getPlatformUsers);

export default router;
