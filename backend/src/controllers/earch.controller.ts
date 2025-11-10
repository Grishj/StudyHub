import { Request, Response, NextFunction } from "express";
import { SearchService } from "@/services/search.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const searchService = new SearchService();

export class SearchController {
  async globalSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!query || query.trim().length < 2) {
        sendError(res, "Search query must be at least 2 characters", 400);
        return;
      }

      const results = await searchService.globalSearch(query.trim(), limit);
      sendSuccess(res, "Search results retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async searchNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        sendError(res, "Search query must be at least 2 characters", 400);
        return;
      }

      const results = await searchService.searchNotes(query.trim(), limit);
      sendSuccess(res, "Notes retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async searchQuestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        sendError(res, "Search query must be at least 2 characters", 400);
        return;
      }

      const results = await searchService.searchQuestions(query.trim(), limit);
      sendSuccess(res, "Questions retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async searchQuizzes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        sendError(res, "Search query must be at least 2 characters", 400);
        return;
      }

      const results = await searchService.searchQuizzes(query.trim(), limit);
      sendSuccess(res, "Quizzes retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async searchGroups(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        sendError(res, "Search query must be at least 2 characters", 400);
        return;
      }

      const results = await searchService.searchGroups(query.trim(), limit);
      sendSuccess(res, "Groups retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async searchUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        sendError(res, "Search query must be at least 2 characters", 400);
        return;
      }

      const results = await searchService.searchUsers(query.trim(), limit);
      sendSuccess(res, "Users retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
