import { Router } from "express";
import { GroupChatController } from "@/controllers/groupChat.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import { uploadSingle } from "@/middleware/upload.middleware";
import { uploadLimiter } from "@/middleware/rateLimit.middleware";
import { body, param, query } from "express-validator";

const router = Router();
const groupChatController = new GroupChatController();

// All routes require authentication
router.use(authenticate);

/**
 * Get group messages
 */
router.get(
  "/:groupId/messages",
  param("groupId").isUUID().withMessage("Invalid group ID"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validate,
  groupChatController.getMessages.bind(groupChatController)
);

/**
 * Send message (REST fallback)
 */
router.post(
  "/:groupId/messages",
  param("groupId").isUUID().withMessage("Invalid group ID"),
  body("content").notEmpty().withMessage("Content is required"),
  body("messageType")
    .optional()
    .isIn(["text", "image", "video", "audio", "file"]),
  validate,
  groupChatController.sendMessage.bind(groupChatController)
);

/**
 * Edit message
 */
router.patch(
  "/messages/:messageId",
  param("messageId").isUUID().withMessage("Invalid message ID"),
  body("content").notEmpty().withMessage("Content is required"),
  validate,
  groupChatController.editMessage.bind(groupChatController)
);

/**
 * Delete message
 */
router.delete(
  "/messages/:messageId",
  param("messageId").isUUID().withMessage("Invalid message ID"),
  validate,
  groupChatController.deleteMessage.bind(groupChatController)
);

/**
 * Get chat statistics
 */
router.get(
  "/:groupId/stats",
  param("groupId").isUUID().withMessage("Invalid group ID"),
  validate,
  groupChatController.getChatStats.bind(groupChatController)
);

/**
 * Search messages
 */
router.get(
  "/:groupId/search",
  param("groupId").isUUID().withMessage("Invalid group ID"),
  query("q").notEmpty().withMessage("Search query is required"),
  validate,
  groupChatController.searchMessages.bind(groupChatController)
);

/**
 * Upload file to chat
 */
router.post(
  "/:groupId/upload",
  param("groupId").isUUID().withMessage("Invalid group ID"),
  uploadLimiter,
  uploadSingle("file"),
  validate,
  groupChatController.uploadFile.bind(groupChatController)
);

export default router;
