import { Router } from 'express';
import { DownloadController } from '@/controllers/download.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const downloadController = new DownloadController();

// ==================== NOTES ====================

/**
 * Download single note file
 */
router.get(
  '/note/:id',
  param('id').isUUID().withMessage('Invalid note ID'),
  validate,
  downloadController.downloadNote.bind(downloadController)
);

/**
 * Download note as JSON
 */
router.get(
  '/note/:id/json',
  param('id').isUUID().withMessage('Invalid note ID'),
  validate,
  downloadController.downloadNoteJSON.bind(downloadController)
);

/**
 * Download multiple notes as ZIP
 */
router.post(
  '/notes/bulk',
  authenticate,
  body('noteIds')
    .isArray({ min: 1 })
    .withMessage('noteIds must be a non-empty array'),
  body('noteIds.*').isUUID().withMessage('Invalid note ID'),
  validate,
  downloadController.downloadMultipleNotes.bind(downloadController)
);

// ==================== QUESTIONS ====================

/**
 * Download single question file
 */
router.get(
  '/question/:id',
  param('id').isUUID().withMessage('Invalid question ID'),
  validate,
  downloadController.downloadQuestion.bind(downloadController)
);

/**
 * Download questions by year
 */
router.get(
  '/questions/year/:year',
  param('year')
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  validate,
  downloadController.downloadQuestionsByYear.bind(downloadController)
);

/**
 * Download questions by category
 */
router.get(
  '/questions/category/:categoryId',
  param('categoryId').isUUID().withMessage('Invalid category ID'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
  validate,
  downloadController.downloadQuestionsByCategory.bind(downloadController)
);

// ==================== SYLLABUS ====================

/**
 * Download single syllabus file
 */
router.get(
  '/syllabus/:id',
  param('id').isUUID().withMessage('Invalid syllabus ID'),
  validate,
  downloadController.downloadSyllabus.bind(downloadController)
);

/**
 * Download all syllabus by category
 */
router.get(
  '/syllabus/category/:categoryId',
  param('categoryId').isUUID().withMessage('Invalid category ID'),
  validate,
  downloadController.downloadCategorySyllabus.bind(downloadController)
);

// ==================== STATISTICS & HISTORY ====================

/**
 * Get download statistics
 */
router.get(
  '/stats',
  authenticate,
  downloadController.getDownloadStats.bind(downloadController)
);

/**
 * Get user download history
 * NEW ROUTE
 */
router.get(
  '/history',
  authenticate,
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  downloadController.getUserDownloadHistory.bind(downloadController)
);

/**
 * Get most downloaded content
 * NEW ROUTE
 */
router.get(
  '/most-downloaded',
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
  validate,
  downloadController.getMostDownloaded.bind(downloadController)
);

export default router;