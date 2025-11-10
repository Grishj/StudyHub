import rateLimit from "express-rate-limit";
import { config } from "@/config/env";
import { Request, Response } from "express";

/**
 * Custom error handler for rate limiting
 */
const handler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
    retryAfter: res.getHeader("Retry-After"),
  });
};

/**
 * Authentication rate limiter - Very strict
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message:
    "Too many authentication attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
});

/**
 * Registration rate limiter - Prevent spam registrations
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message:
    "Too many accounts created from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler,
});

/**
 * Password reset limiter
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: "Too many password reset attempts, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
});

/**
 * Upload rate limiter - Prevent abuse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: "Too many upload requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes by default
  max: config.rateLimit.maxRequests, // 100 requests per windowMs by default
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Strict rate limiter for expensive operations
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: "Too many requests for this operation, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Search rate limiter
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
  message: "Too many search requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Quiz submission limiter
 */
export const quizLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 quiz submissions per 5 minutes
  message: "Too many quiz submissions, please wait before submitting again",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Comment/Post rate limiter - Prevent spam
 */
export const contentCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 posts/comments per 15 minutes
  message: "You are posting too frequently, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Vote rate limiter
 */
export const voteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 votes per minute
  message: "Too many vote requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * WebSocket connection limiter
 */
export const socketLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 connection attempts per 5 minutes
  message: "Too many connection attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
