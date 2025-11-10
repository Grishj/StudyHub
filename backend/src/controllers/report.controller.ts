import { Request, Response, NextFunction } from "express";
import { ReportService } from "@/services/report.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const reportService = new ReportService();

export class ReportController {
  async createReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await reportService.createReport(req.user!.id, req.body);
      sendSuccess(res, "Report submitted successfully", report, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const reports = await reportService.getUserReports(
        req.user!.id,
        page,
        limit
      );
      sendSuccess(res, "Reports retrieved successfully", reports);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getAllReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const status = req.query.status as string;
      const contentType = req.query.contentType as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const reports = await reportService.getAllReports(
        status,
        contentType,
        page,
        limit
      );
      sendSuccess(res, "Reports retrieved successfully", reports);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateReportStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await reportService.updateReportStatus(
        req.params.id,
        req.body.status
      );
      sendSuccess(res, "Report status updated successfully", report);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await reportService.deleteReport(req.params.id, req.user!.id);
      sendSuccess(res, "Report deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
