import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { Permission } from '@workspace/shared-types';
import * as githubController from '../controllers/github.controller';

const router = Router();

// Public Webhook Ingress (signature verified internally)
router.post('/webhook', githubController.handleWebhook);

// Protected GitHub Integration Routes
router.use(authenticate, resolvePermissions);

router.get(
  '/repos',
  requirePermission([Permission.GITHUB_READ]),
  githubController.listRepositories
);

router.post(
  '/connect',
  requirePermission([Permission.GITHUB_MANAGE]),
  githubController.connectRepository
);

router.delete(
  '/repos/:id',
  requirePermission([Permission.GITHUB_MANAGE]),
  githubController.disconnectRepository
);

router.post(
  '/sync/:id',
  requirePermission([Permission.GITHUB_MANAGE]),
  githubController.syncPullRequests
);

export default router;
