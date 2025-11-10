import { Router } from "express";
import { NotificationController } from "@/controllers/notification.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import { param } from "express-validator";

const router = Router();
const notificationController = new NotificationController();

// All routes are protected
router.use(authenticate);

router.get(
  "/",
  notificationController.getNotifications.bind(notificationController)
);

router.get(
  "/unread-count",
  notificationController.getUnreadCount.bind(notificationController)
);

router.patch(
  "/mark-all-read",
  notificationController.markAllAsRead.bind(notificationController)
);

router.patch(
  "/:id/read",
  param("id").isUUID(),
  validate,
  notificationController.markAsRead.bind(notificationController)
);

router.delete(
  "/all",
  notificationController.deleteAllNotifications.bind(notificationController)
);

router.delete(
  "/:id",
  param("id").isUUID(),
  validate,
  notificationController.deleteNotification.bind(notificationController)
);

export default router;
