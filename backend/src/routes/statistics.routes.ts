import { Router } from "express";
import { StatisticsController } from "@/controllers/statistics.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import { param, query } from "express-validator";

const router = Router();
const statisticsController = new StatisticsController();

// ==================== INDIVIDUAL STATISTICS ====================

/**
 * Get note statistics
 */
router.get(
  "/note/:id",
  param("id").isUUID().withMessage("Invalid note ID"),
  validate,
  statisticsController.getNoteStatistics.bind(statisticsController)
);

/**
 * Get question statistics
 */
router.get(
  "/question/:id",
  param("id").isUUID().withMessage("Invalid question ID"),
  validate,
  statisticsController.getQuestionStatistics.bind(statisticsController)
);

/**
 * Get syllabus statistics
 */
router.get(
  "/syllabus/:id",
  param("id").isUUID().withMessage("Invalid syllabus ID"),
  validate,
  statisticsController.getSyllabusStatistics.bind(statisticsController)
);

// ==================== TOP CONTENT ====================

/**
 * Get top notes
 */
router.get(
  "/top/notes",
  query("criteria").optional().isIn(["views", "upvotes", "downloads"]),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validate,
  statisticsController.getTopNotes.bind(statisticsController)
);

/**
 * Get top questions
 */
router.get(
  "/top/questions",
  query("criteria").optional().isIn(["views", "upvotes", "downloads"]),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validate,
  statisticsController.getTopQuestions.bind(statisticsController)
);

// ==================== CATEGORY STATISTICS ====================

/**
 * Get category statistics
 */
router.get(
  "/category/:categoryId",
  param("categoryId").isUUID().withMessage("Invalid category ID"),
  validate,
  statisticsController.getCategoryStatistics.bind(statisticsController)
);

// ==================== USER STATISTICS ====================

/**
 * Get user contribution statistics
 */
router.get(
  "/user/contributions",
  authenticate,
  statisticsController.getUserContributionStats.bind(statisticsController)
);

/**
 * Get user contribution statistics by ID
 */
router.get(
  "/user/:userId/contributions",
  param("userId").isUUID().withMessage("Invalid user ID"),
  validate,
  statisticsController.getUserContributionStats.bind(statisticsController)
);

// ==================== TRENDING ====================

/**
 * Get trending content
 */
router.get(
  "/trending",
  query("limit").optional().isInt({ min: 1, max: 50 }),
  validate,
  statisticsController.getTrendingContent.bind(statisticsController)
);

// ==================== TRACKING ====================

/**
 * Increment view count (called from frontend)
 */
router.post(
  "/track/view",
  statisticsController.incrementViewCount.bind(statisticsController)
);

export default router;
