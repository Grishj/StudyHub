import { Request, Response, NextFunction } from "express";
import { upload } from "@/config/upload.config";
import { sendError } from "@/utils/response.util";

export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          sendError(res, "File size exceeds 10MB limit", 400);
          return;
        }
        sendError(res, err.message, 400);
        return;
      }
      next();
    });
  };
};

export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          sendError(res, "File size exceeds 10MB limit", 400);
          return;
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          sendError(res, `Maximum ${maxCount} files allowed`, 400);
          return;
        }
        sendError(res, err.message, 400);
        return;
      }
      next();
    });
  };
};
