import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login)
);

router.post(
  '/refresh',
  validateRequest({ body: refreshSchema }),
  asyncHandler(authController.refresh)
);

router.post('/logout', asyncHandler(authController.logout));

router.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));

router.get('/me', authenticate, asyncHandler(authController.me));

router.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
);

export default router;
