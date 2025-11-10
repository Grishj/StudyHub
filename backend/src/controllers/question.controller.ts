import { Request, Response, NextFunction } from "express";
import { QuestionService } from "@/services/question.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const questionService = new QuestionService();

export class QuestionController {
  async createQuestion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const question = await questionService.createQuestion(
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Question created successfully", question, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        categoryId: req.query.categoryId as string,
        tags: req.query.tags
          ? (req.query.tags as string).split(",")
          : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        userId: req.query.userId as string,
        search: req.query.search as string,
        isApproved: req.query.isApproved === "true",
        sortBy: req.query.sortBy as "recent" | "popular" | "trending",
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const questions = await questionService.getQuestions(filters);
      sendSuccess(res, "Questions retrieved successfully", questions);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getQuestionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const question = await questionService.getQuestionById(
        req.params.id,
        req.user?.id
      );
      sendSuccess(res, "Question retrieved successfully", question);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateQuestion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const question = await questionService.updateQuestion(
        req.params.id,
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Question updated successfully", question);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteQuestion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await questionService.deleteQuestion(req.params.id, req.user!.id);
      sendSuccess(res, "Question deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async voteQuestion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await questionService.voteQuestion(
        req.params.id,
        req.user!.id,
        req.body.voteType
      );
      sendSuccess(res, result.message, result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getComments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comments = await questionService.getComments(req.params.id);
      sendSuccess(res, "Comments retrieved successfully", comments);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async addComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comment = await questionService.addComment(
        req.params.id,
        req.user!.id,
        req.body.content
      );
      sendSuccess(res, "Comment added successfully", comment, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
