import { Router } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
} from "@/middleware/rateLimit.middleware";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "@/validators/auth.validator";

const router = Router();
const authController = new AuthController();

// ==================== PUBLIC ROUTES ====================

/**
 * Register new user
 * Rate limit: 3 registrations per hour per IP
 */
router.post(
  "/register",
  registerLimiter,
  registerValidator,
  validate,
  authController.register.bind(authController)
);

/**
 * Login user
 * Rate limit: 5 attempts per 15 minutes
 * Skips successful login attempts from count
 */
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validate,
  authController.login.bind(authController)
);

/**
 * Request password reset
 * Rate limit: 3 requests per hour
 */
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword.bind(authController)
);

/**
 * Reset password with token
 * Rate limit: 3 attempts per hour
 */
router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword.bind(authController)
);

/**
 * Refresh access token
 * No rate limit - uses refresh token validation
 */
router.post("/refresh-token", authController.refreshToken.bind(authController));

// ==================== PROTECTED ROUTES ====================

/**
 * Logout user
 * Requires authentication
 */
router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController)
);

/**
 * Get current user profile
 * Requires authentication
 */
router.get(
  "/profile",
  authenticate,
  authController.getProfile.bind(authController)
);

export default router;
