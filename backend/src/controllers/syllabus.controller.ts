import { Request, Response, NextFunction } from "express";
import { SyllabusService } from "@/services/syllabus.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const syllabusService = new SyllabusService();

export class SyllabusController {
  async createSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const syllabus = await syllabusService.createSyllabus(req.body);
      sendSuccess(res, "Syllabus created successfully", syllabus, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAllSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string;
      const includeUnpublished = req.query.includeUnpublished === "true";

      const syllabusList = await syllabusService.getAllSyllabus(
        categoryId,
        includeUnpublished
      );
      sendSuccess(res, "Syllabus retrieved successfully", syllabusList);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getSyllabusByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const includeUnpublished = req.query.includeUnpublished === "true";
      const result = await syllabusService.getSyllabusByCategory(
        req.params.categoryId,
        includeUnpublished
      );
      sendSuccess(res, "Syllabus retrieved successfully", result);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async getSyllabusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const syllabus = await syllabusService.getSyllabusById(req.params.id);
      sendSuccess(res, "Syllabus retrieved successfully", syllabus);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const syllabus = await syllabusService.updateSyllabus(
        req.params.id,
        req.body
      );
      sendSuccess(res, "Syllabus updated successfully", syllabus);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await syllabusService.deleteSyllabus(req.params.id);
      sendSuccess(res, "Syllabus deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async reorderSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const syllabusList = await syllabusService.reorderSyllabus(
        req.params.categoryId,
        req.body.items
      );
      sendSuccess(res, "Syllabus reordered successfully", syllabusList);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async togglePublish(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const syllabus = await syllabusService.togglePublish(req.params.id);
      sendSuccess(
        res,
        `Syllabus ${
          syllabus.isPublished ? "published" : "unpublished"
        } successfully`,
        syllabus
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAdjacentSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adjacent = await syllabusService.getAdjacentSyllabus(req.params.id);
      sendSuccess(res, "Adjacent syllabus retrieved successfully", adjacent);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async searchSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const categoryId = req.query.categoryId as string;

      if (!query) {
        sendError(res, "Search query is required", 400);
        return;
      }

      const results = await syllabusService.searchSyllabus(query, categoryId);
      sendSuccess(res, "Search results retrieved successfully", results);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
