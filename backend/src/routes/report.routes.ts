import { Router } from "express";
import { ReportController } from "@/controllers/report.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import { reportValidator } from "@/validators/common.validator";
import { contentCreationLimiter } from "@/middleware/rateLimit.middleware";
import { body, param } from "express-validator";

const router = Router();
const reportController = new ReportController();

// All routes require authentication
router.use(authenticate);

// Create report - 30 reports per 15 minutes
router.post(
  "/",
  contentCreationLimiter,
  reportValidator,
  validate,
  reportController.createReport.bind(reportController)
);

// Get user's reports
router.get("/my", reportController.getUserReports.bind(reportController));

// Get all reports (admin only)
router.get("/all", reportController.getAllReports.bind(reportController));

// Update report status (admin only)
router.patch(
  "/:id/status",
  param("id").isUUID(),
  body("status").isIn(["pending", "reviewed", "resolved"]),
  validate,
  reportController.updateReportStatus.bind(reportController)
);

// Delete report
router.delete(
  "/:id",
  param("id").isUUID(),
  validate,
  reportController.deleteReport.bind(reportController)
);

export default router;
