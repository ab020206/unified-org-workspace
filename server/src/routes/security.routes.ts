import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { SecurityController } from '../controllers/security.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const controller = new SecurityController();

router.use(authenticate);

router.get('/sessions', asyncHandler(controller.getActiveSessions));
router.delete('/sessions/:sessionId', asyncHandler(controller.revokeSession));
router.post('/sessions/logout-all', asyncHandler(controller.logoutAllDevices));

export default router;
