import { Router } from "express";
import { QuizController } from "@/controllers/quiz.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  createQuizValidator,
  submitQuizValidator,
  quizIdValidator,
} from "@/validators/quiz.validator";
import { quizLimiter, strictLimiter } from "@/middleware/rateLimit.middleware";

const router = Router();
const quizController = new QuizController();

// Public routes
router.get("/", quizController.getQuizzes.bind(quizController));

router.get("/daily", quizController.getDailyQuiz.bind(quizController));

router.get(
  "/leaderboard",
  quizController.getGlobalLeaderboard.bind(quizController)
);

router.get(
  "/:id",
  quizIdValidator,
  validate,
  quizController.getQuizById.bind(quizController)
);

router.get(
  "/:id/leaderboard",
  quizIdValidator,
  validate,
  quizController.getQuizLeaderboard.bind(quizController)
);

router.get(
  "/:id/stats",
  quizIdValidator,
  validate,
  quizController.getQuizStats.bind(quizController)
);

// Protected routes
router.post(
  "/",
  authenticate,
  strictLimiter, // 10 requests per 15 minutes
  createQuizValidator,
  validate,
  quizController.createQuiz.bind(quizController)
);

router.post(
  "/:id/submit",
  authenticate,
  quizLimiter, // 5 submissions per 5 minutes
  submitQuizValidator,
  validate,
  quizController.submitQuiz.bind(quizController)
);

router.get(
  "/attempts/:attemptId",
  authenticate,
  quizController.getQuizResult.bind(quizController)
);

router.get(
  "/history/me",
  authenticate,
  quizController.getUserQuizHistory.bind(quizController)
);

router.patch(
  "/:id",
  authenticate,
  quizIdValidator,
  validate,
  quizController.updateQuiz.bind(quizController)
);

router.delete(
  "/:id",
  authenticate,
  quizIdValidator,
  validate,
  quizController.deleteQuiz.bind(quizController)
);

export default router;
