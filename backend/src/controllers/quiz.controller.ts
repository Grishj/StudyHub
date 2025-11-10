import { Request, Response, NextFunction } from "express";
import { QuizService } from "@/services/quiz.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const quizService = new QuizService();

export class QuizController {
  async createQuiz(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quiz = await quizService.createQuiz(req.body);
      sendSuccess(res, "Quiz created successfully", quiz, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuizzes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        categoryId: req.query.categoryId as string,
        difficulty: req.query.difficulty as string,
        isDaily: req.query.isDaily === "true",
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const quizzes = await quizService.getQuizzes(filters);
      sendSuccess(res, "Quizzes retrieved successfully", quizzes);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuizById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quiz = await quizService.getQuizById(req.params.id, req.user?.id);
      sendSuccess(res, "Quiz retrieved successfully", quiz);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async submitQuiz(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await quizService.submitQuiz(
        req.params.id,
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Quiz submitted successfully", result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuizResult(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await quizService.getQuizResult(
        req.params.attemptId,
        req.user!.id
      );
      sendSuccess(res, "Quiz result retrieved successfully", result);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async getUserQuizHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await quizService.getUserQuizHistory(
        req.user!.id,
        page,
        limit
      );
      sendSuccess(res, "Quiz history retrieved successfully", history);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getDailyQuiz(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quiz = await quizService.getDailyQuiz();

      if (!quiz) {
        sendSuccess(res, "No daily quiz available today", null);
        return;
      }

      sendSuccess(res, "Daily quiz retrieved successfully", quiz);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuizLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await quizService.getQuizLeaderboard(
        req.params.id,
        limit
      );
      sendSuccess(res, "Leaderboard retrieved successfully", leaderboard);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getGlobalLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await quizService.getGlobalLeaderboard(limit);
      sendSuccess(
        res,
        "Global leaderboard retrieved successfully",
        leaderboard
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateQuiz(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quiz = await quizService.updateQuiz(req.params.id, req.body);
      sendSuccess(res, "Quiz updated successfully", quiz);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteQuiz(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await quizService.deleteQuiz(req.params.id);
      sendSuccess(res, "Quiz deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuizStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await quizService.getQuizStats(req.params.id);
      sendSuccess(res, "Quiz statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
