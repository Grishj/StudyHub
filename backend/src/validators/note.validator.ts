import { body, param, query } from 'express-validator';

export const createNoteValidator = [
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

  body('fileType')
    .optional()
    .isIn(['pdf', 'image', 'text'])
    .withMessage('Invalid file type'),

  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('Invalid file URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

export const updateNoteValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid note ID'),

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

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

export const noteIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid note ID'),
];
