import { Request, Response, NextFunction } from "express";
import { NotificationService } from "@/services/notification.service";
import { sendSuccess, sendError } from "@/utils/response.util";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === "true";

      const notifications = await notificationService.getUserNotifications(
        req.user!.id,
        page,
        limit,
        unreadOnly
      );

      sendSuccess(res, "Notifications retrieved successfully", notifications);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user!.id);
      sendSuccess(res, "Unread count retrieved successfully", { count });
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user!.id
      );
      sendSuccess(res, "Notification marked as read", notification);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, "All notifications marked as read");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await notificationService.deleteNotification(req.params.id, req.user!.id);
      sendSuccess(res, "Notification deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteAllNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await notificationService.deleteAllNotifications(req.user!.id);
      sendSuccess(res, "All notifications deleted successfully");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}
