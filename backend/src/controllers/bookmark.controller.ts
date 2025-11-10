import { Request, Response, NextFunction } from "express";
import { BookmarkService } from "@/services/bookmark.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const bookmarkService = new BookmarkService();

export class BookmarkController {
  async toggleBookmark(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { contentType, contentId } = req.body;

      if (!["note", "question"].includes(contentType)) {
        sendError(res, "Invalid content type", 400);
        return;
      }

      const result = await bookmarkService.toggleBookmark(
        req.user!.id,
        contentType,
        contentId
      );

      sendSuccess(res, result.message, result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserBookmarks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const type = req.query.type as "note" | "question" | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const bookmarks = await bookmarkService.getUserBookmarks(
        req.user!.id,
        type,
        page,
        limit
      );

      sendSuccess(res, "Bookmarks retrieved successfully", bookmarks);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async isBookmarked(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { contentType, contentId } = req.params;

      if (!["note", "question"].includes(contentType)) {
        sendError(res, "Invalid content type", 400);
        return;
      }

      const isBookmarked = await bookmarkService.isBookmarked(
        req.user!.id,
        contentType as "note" | "question",
        contentId
      );

      sendSuccess(res, "Bookmark status retrieved", { isBookmarked });
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
