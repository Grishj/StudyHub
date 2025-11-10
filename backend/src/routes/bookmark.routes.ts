import { Router } from "express";
import { BookmarkController } from "@/controllers/bookmark.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import { body, param } from "express-validator";

const router = Router();
const bookmarkController = new BookmarkController();

// All routes require authentication
router.use(authenticate);

// Toggle bookmark
router.post(
  "/toggle",
  body("contentType")
    .isIn(["note", "question"])
    .withMessage("Invalid content type"),
  body("contentId").isUUID().withMessage("Invalid content ID"),
  validate,
  bookmarkController.toggleBookmark.bind(bookmarkController)
);

// Get user's bookmarks
router.get("/", bookmarkController.getUserBookmarks.bind(bookmarkController));

// Check if content is bookmarked
router.get(
  "/check/:contentType/:contentId",
  param("contentType").isIn(["note", "question"]),
  param("contentId").isUUID(),
  validate,
  bookmarkController.isBookmarked.bind(bookmarkController)
);

export default router;
