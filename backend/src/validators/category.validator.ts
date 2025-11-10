import { body, param, query } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Icon must not exceed 200 characters"),
];

export const updateCategoryValidator = [
  param("id").isUUID().withMessage("Invalid category ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Icon must not exceed 200 characters"),
];

export const categoryIdValidator = [
  param("id").isUUID().withMessage("Invalid category ID"),
];

export const categoryNameValidator = [
  param("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Invalid category name"),
];
