import { Request, Response, NextFunction } from "express";
import { StatisticsService } from "@/services/statistics.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const statisticsService = new StatisticsService();

export class StatisticsController {
  /**
   * Get note statistics
   */
  async getNoteStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await statisticsService.getNoteStatistics(req.params.id);
      sendSuccess(res, "Note statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Get question statistics
   */
  async getQuestionStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await statisticsService.getQuestionStatistics(
        req.params.id
      );
      sendSuccess(res, "Question statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Get syllabus statistics
   */
  async getSyllabusStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await statisticsService.getSyllabusStatistics(
        req.params.id
      );
      sendSuccess(res, "Syllabus statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Get top notes
   */
  async getTopNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria =
        (req.query.criteria as "views" | "upvotes" | "downloads") || "views";
      const limit = parseInt(req.query.limit as string) || 10;

      const notes = await statisticsService.getTopNotes(criteria, limit);
      sendSuccess(res, "Top notes retrieved successfully", notes);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get top questions
   */
  async getTopQuestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria =
        (req.query.criteria as "views" | "upvotes" | "downloads") || "views";
      const limit = parseInt(req.query.limit as string) || 10;

      const questions = await statisticsService.getTopQuestions(
        criteria,
        limit
      );
      sendSuccess(res, "Top questions retrieved successfully", questions);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await statisticsService.getCategoryStatistics(
        req.params.categoryId
      );
      sendSuccess(res, "Category statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Get user contribution statistics
   */
  async getUserContributionStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.id;
      const stats = await statisticsService.getUserContributionStats(userId);
      sendSuccess(
        res,
        "User contribution statistics retrieved successfully",
        stats
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get trending content
   */
  async getTrendingContent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const trending = await statisticsService.getTrendingContent(limit);
      sendSuccess(res, "Trending content retrieved successfully", trending);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { contentType, contentId } = req.body;

      if (!["note", "question", "syllabus"].includes(contentType)) {
        sendError(res, "Invalid content type", 400);
        return;
      }

      await statisticsService.incrementViewCount(contentType, contentId);
      sendSuccess(res, "View count incremented");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
