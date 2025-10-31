import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { authLimiter } from '@/middleware/rateLimit.middleware';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '@/validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  authController.login.bind(authController)
);

router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword.bind(authController)
);

router.post(
  '/refresh-token',
  authController.refreshToken.bind(authController)
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

export default router;