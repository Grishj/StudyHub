import { body, param } from 'express-validator';

export const createQuestionValidator = [
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .isUUID()
    .withMessage('Invalid category ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),

  body('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Invalid year'),

  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('Invalid file URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

export const updateQuestionValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid question ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),

  body('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
];

export const questionIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid question ID'),
];
