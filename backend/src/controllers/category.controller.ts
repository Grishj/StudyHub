import { Request, Response, NextFunction } from "express";
import { CategoryService } from "@/services/category.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      sendSuccess(res, "Category created successfully", category, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const includeStats = req.query.includeStats === "true";
      const categories = await categoryService.getCategories(includeStats);
      sendSuccess(res, "Categories retrieved successfully", categories);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const includeSyllabus = req.query.includeSyllabus === "true";
      const category = await categoryService.getCategoryById(
        req.params.id,
        includeSyllabus
      );
      sendSuccess(res, "Category retrieved successfully", category);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async getCategoryByName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.getCategoryByName(req.params.name);
      sendSuccess(res, "Category retrieved successfully", category);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );
      sendSuccess(res, "Category updated successfully", category);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await categoryService.deleteCategory(req.params.id);
      sendSuccess(res, "Category deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCategoryStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await categoryService.getCategoryStats(req.params.id);
      sendSuccess(res, "Category statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }
}
