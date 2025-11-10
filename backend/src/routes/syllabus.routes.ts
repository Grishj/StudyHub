import { Router } from "express";
import { SyllabusController } from "@/controllers/syllabus.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  createSyllabusValidator,
  updateSyllabusValidator,
  syllabusIdValidator,
  reorderSyllabusValidator,
} from "@/validators/syllabus.validator";
import { param } from "express-validator";

const router = Router();
const syllabusController = new SyllabusController();

// Public routes
router.get("/", syllabusController.getAllSyllabus.bind(syllabusController));

router.get(
  "/search",
  syllabusController.searchSyllabus.bind(syllabusController)
);

router.get(
  "/category/:categoryId",
  param("categoryId").isUUID(),
  validate,
  syllabusController.getSyllabusByCategory.bind(syllabusController)
);

router.get(
  "/:id",
  syllabusIdValidator,
  validate,
  syllabusController.getSyllabusById.bind(syllabusController)
);

router.get(
  "/:id/adjacent",
  syllabusIdValidator,
  validate,
  syllabusController.getAdjacentSyllabus.bind(syllabusController)
);

// Protected routes (admin only - add admin middleware as needed)
router.post(
  "/",
  authenticate,
  createSyllabusValidator,
  validate,
  syllabusController.createSyllabus.bind(syllabusController)
);

router.patch(
  "/:id",
  authenticate,
  updateSyllabusValidator,
  validate,
  syllabusController.updateSyllabus.bind(syllabusController)
);

router.delete(
  "/:id",
  authenticate,
  syllabusIdValidator,
  validate,
  syllabusController.deleteSyllabus.bind(syllabusController)
);

router.post(
  "/category/:categoryId/reorder",
  authenticate,
  reorderSyllabusValidator,
  validate,
  syllabusController.reorderSyllabus.bind(syllabusController)
);

router.patch(
  "/:id/toggle-publish",
  authenticate,
  syllabusIdValidator,
  validate,
  syllabusController.togglePublish.bind(syllabusController)
);

export default router;
