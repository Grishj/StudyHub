import { body, param } from "express-validator";

export const createSyllabusValidator = [
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isUUID()
    .withMessage("Invalid category ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("fileUrl").optional().isURL().withMessage("Invalid file URL"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
];

export const updateSyllabusValidator = [
  param("id").isUUID().withMessage("Invalid syllabus ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("fileUrl").optional().isURL().withMessage("Invalid file URL"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
];

export const syllabusIdValidator = [
  param("id").isUUID().withMessage("Invalid syllabus ID"),
];

export const reorderSyllabusValidator = [
  param("categoryId").isUUID().withMessage("Invalid category ID"),

  body("items").isArray({ min: 1 }).withMessage("Items array is required"),

  body("items.*.syllabusId").isUUID().withMessage("Invalid syllabus ID"),

  body("items.*.newOrder")
    .isInt({ min: 0 })
    .withMessage("New order must be a non-negative integer"),
];
