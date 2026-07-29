import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

router.get('/', asyncHandler(healthController.getHealth));
router.get('/live', asyncHandler(healthController.getLiveness));
router.get('/ready', asyncHandler(healthController.getReadiness));

export default router;
