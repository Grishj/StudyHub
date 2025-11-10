import { body, param } from 'express-validator';

export const createQuizValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),

  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive number'),

  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),

  body('questions.*.question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),

  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Question must have 2-6 options'),

  body('questions.*.correctAnswer')
    .notEmpty()
    .withMessage('Correct answer is required'),

  body('questions.*.points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be a positive number'),
];

export const submitQuizValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid quiz ID'),

  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers are required'),

  body('answers.*.questionId')
    .isUUID()
    .withMessage('Invalid question ID'),

  body('answers.*.answer')
    .notEmpty()
    .withMessage('Answer is required'),

  body('timeTaken')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Invalid time taken'),
];

export const quizIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid quiz ID'),
];
