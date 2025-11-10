import { Router } from "express";
import { NoteController } from "@/controllers/note.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
} from "@/validators/note.validator";
import { voteValidator, commentValidator } from "@/validators/common.validator";
import {
  contentCreationLimiter,
  voteLimiter,
} from "@/middleware/rateLimit.middleware";

const router = Router();
const noteController = new NoteController();

// Public routes
router.get("/", noteController.getNotes.bind(noteController));

router.get(
  "/:id",
  noteIdValidator,
  validate,
  noteController.getNoteById.bind(noteController)
);

router.get(
  "/:id/comments",
  noteIdValidator,
  validate,
  noteController.getComments.bind(noteController)
);

// Protected routes
router.post(
  "/",
  authenticate,
  contentCreationLimiter, // 30 posts per 15 minutes
  createNoteValidator,
  validate,
  noteController.createNote.bind(noteController)
);

router.patch(
  "/:id",
  authenticate,
  updateNoteValidator,
  validate,
  noteController.updateNote.bind(noteController)
);

router.delete(
  "/:id",
  authenticate,
  noteIdValidator,
  validate,
  noteController.deleteNote.bind(noteController)
);

router.post(
  "/:id/vote",
  authenticate,
  voteLimiter, // 30 votes per minute
  noteIdValidator,
  voteValidator,
  validate,
  noteController.voteNote.bind(noteController)
);

router.post(
  "/:id/comments",
  authenticate,
  contentCreationLimiter, // 30 comments per 15 minutes
  noteIdValidator,
  commentValidator,
  validate,
  noteController.addComment.bind(noteController)
);

router.delete(
  "/comments/:commentId",
  authenticate,
  noteController.deleteComment.bind(noteController)
);

export default router;
