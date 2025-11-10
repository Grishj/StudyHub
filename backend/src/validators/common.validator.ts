import { body, param } from 'express-validator';

export const voteValidator = [
  body('voteType')
    .notEmpty()
    .withMessage('Vote type is required')
    .isIn(['upvote', 'downvote'])
    .withMessage('Invalid vote type'),
];

export const commentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

export const uuidValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID'),
];

export const reportValidator = [
  body('contentType')
    .notEmpty()
    .withMessage('Content type is required')
    .isIn(['note', 'question', 'comment'])
    .withMessage('Invalid content type'),

  body('contentId')
    .notEmpty()
    .withMessage('Content ID is required')
    .isUUID()
    .withMessage('Invalid content ID'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Reason must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];
