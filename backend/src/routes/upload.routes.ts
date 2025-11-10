import { Router } from "express";
import { UploadController } from "@/controllers/upload.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { uploadSingle, uploadMultiple } from "@/middleware/upload.middleware";
import { uploadLimiter } from "@/middleware/rateLimit.middleware";
import { validate } from "@/middleware/validation.middleware";
import { param } from "express-validator";

const router = Router();
const uploadController = new UploadController();

// All routes require authentication
router.use(authenticate);

// Upload single file - 20 uploads per hour
router.post(
  "/single",
  uploadLimiter,
  uploadSingle("file"),
  uploadController.uploadSingle.bind(uploadController)
);

// Upload multiple files - 20 uploads per hour
router.post(
  "/multiple",
  uploadLimiter,
  uploadMultiple("files", 5),
  uploadController.uploadMultiple.bind(uploadController)
);

// Download file - no rate limit
router.get(
  "/download/:id",
  param("id").isUUID(),
  validate,
  uploadController.downloadFile.bind(uploadController)
);

// Delete file - no rate limit
router.delete(
  "/:id",
  param("id").isUUID(),
  validate,
  uploadController.deleteFile.bind(uploadController)
);

// Get user's files - no rate limit
router.get("/", uploadController.getUserFiles.bind(uploadController));

export default router;
