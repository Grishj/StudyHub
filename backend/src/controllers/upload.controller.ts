import { Request, Response, NextFunction } from "express";
import { UploadService } from "@/services/upload.service";
import { sendSuccess, sendError } from "@/utils/response.util";
import path from "path";
import fs from "fs";

const uploadService = new UploadService();

export class UploadController {
  async uploadSingle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, "No file uploaded", 400);
        return;
      }

      const file = await uploadService.saveFileMetadata(
        req.user!.id,
        req.file,
        req.body.category
      );

      sendSuccess(res, "File uploaded successfully", file, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async uploadMultiple(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        sendError(res, "No files uploaded", 400);
        return;
      }

      const files = await uploadService.saveMultipleFilesMetadata(
        req.user!.id,
        req.files,
        req.body.category
      );

      sendSuccess(res, "Files uploaded successfully", files, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async downloadFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = await uploadService.getFileById(req.params.id);

      if (!fs.existsSync(file.path)) {
        sendError(res, "File not found on server", 404);
        return;
      }

      res.download(file.path, file.originalName);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async deleteFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await uploadService.deleteFile(req.params.id, req.user!.id);
      sendSuccess(res, "File deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = req.query.category as string;
      const files = await uploadService.getUserFiles(req.user!.id, category);
      sendSuccess(res, "Files retrieved successfully", files);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
