import { Router } from "express";
import { CategoryController } from "@/controllers/category.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validation.middleware";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
  categoryNameValidator,
} from "@/validators/category.validator";

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get("/", categoryController.getCategories.bind(categoryController));

router.get(
  "/:id",
  categoryIdValidator,
  validate,
  categoryController.getCategoryById.bind(categoryController)
);

router.get(
  "/name/:name",
  categoryNameValidator,
  validate,
  categoryController.getCategoryByName.bind(categoryController)
);

router.get(
  "/:id/stats",
  categoryIdValidator,
  validate,
  categoryController.getCategoryStats.bind(categoryController)
);

// Protected routes (admin only - you can add admin middleware)
router.post(
  "/",
  authenticate,
  createCategoryValidator,
  validate,
  categoryController.createCategory.bind(categoryController)
);

router.patch(
  "/:id",
  authenticate,
  updateCategoryValidator,
  validate,
  categoryController.updateCategory.bind(categoryController)
);

router.delete(
  "/:id",
  authenticate,
  categoryIdValidator,
  validate,
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
