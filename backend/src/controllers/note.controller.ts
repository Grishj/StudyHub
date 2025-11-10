import { Request, Response, NextFunction } from "express";
import { NoteService } from "@/services/note.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const noteService = new NoteService();

export class NoteController {
  async createNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const note = await noteService.createNote(req.user!.id, req.body);
      sendSuccess(res, "Note created successfully", note, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getNotes(
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
        userId: req.query.userId as string,
        search: req.query.search as string,
        isApproved: req.query.isApproved === "true",
        sortBy: req.query.sortBy as "recent" | "popular" | "trending",
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const notes = await noteService.getNotes(filters);
      sendSuccess(res, "Notes retrieved successfully", notes);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getNoteById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const note = await noteService.getNoteById(req.params.id, req.user?.id);
      sendSuccess(res, "Note retrieved successfully", note);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const note = await noteService.updateNote(
        req.params.id,
        req.user!.id,
        req.body
      );
      sendSuccess(res, "Note updated successfully", note);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await noteService.deleteNote(req.params.id, req.user!.id);
      sendSuccess(res, "Note deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async voteNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await noteService.voteNote(
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
      const comments = await noteService.getComments(req.params.id);
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
      const comment = await noteService.addComment(
        req.params.id,
        req.user!.id,
        req.body.content
      );
      sendSuccess(res, "Comment added successfully", comment, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await noteService.deleteComment(req.params.commentId, req.user!.id);
      sendSuccess(res, "Comment deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
