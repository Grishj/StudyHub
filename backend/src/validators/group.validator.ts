import { body, param } from 'express-validator';

export const createGroupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Group name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('type')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Invalid group type'),

  body('category')
    .optional()
    .trim(),
];

export const updateGroupValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid group ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Group name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

export const groupIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid group ID'),
];
