import { Router } from "express";
import { QuestionController } from "@/controllers/question.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  createQuestionValidator,
  updateQuestionValidator,
  questionIdValidator,
} from "@/validators/question.validator";
import { voteValidator, commentValidator } from "@/validators/common.validator";
import {
  contentCreationLimiter,
  voteLimiter,
} from "@/middleware/rateLimit.middleware";

const router = Router();
const questionController = new QuestionController();

// Public routes
router.get("/", questionController.getQuestions.bind(questionController));

router.get(
  "/:id",
  questionIdValidator,
  validate,
  questionController.getQuestionById.bind(questionController)
);

router.get(
  "/:id/comments",
  questionIdValidator,
  validate,
  questionController.getComments.bind(questionController)
);

// Protected routes
router.post(
  "/",
  authenticate,
  contentCreationLimiter, // 30 posts per 15 minutes
  createQuestionValidator,
  validate,
  questionController.createQuestion.bind(questionController)
);

router.patch(
  "/:id",
  authenticate,
  updateQuestionValidator,
  validate,
  questionController.updateQuestion.bind(questionController)
);

router.delete(
  "/:id",
  authenticate,
  questionIdValidator,
  validate,
  questionController.deleteQuestion.bind(questionController)
);

router.post(
  "/:id/vote",
  authenticate,
  voteLimiter, // 30 votes per minute
  questionIdValidator,
  voteValidator,
  validate,
  questionController.voteQuestion.bind(questionController)
);

router.post(
  "/:id/comments",
  authenticate,
  contentCreationLimiter, // 30 comments per 15 minutes
  questionIdValidator,
  commentValidator,
  validate,
  questionController.addComment.bind(questionController)
);

export default router;
