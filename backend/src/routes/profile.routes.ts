import { Router } from 'express';
import { ProfileController } from '@/controllers/profile.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import {
  updateProfileValidator,
  updateAvatarValidator,
} from '@/validators/profile.validator';
import { body, param } from 'express-validator';

const router = Router();
const profileController = new ProfileController();

// All routes are protected
router.use(authenticate);

// Get own profile
router.get('/me', profileController.getProfile.bind(profileController));

// Get profile by ID (public view)
router.get(
  '/:id',
  param('id').isUUID(),
  validate,
  profileController.getProfileById.bind(profileController)
);

// Update profile
router.patch(
  '/me',
  updateProfileValidator,
  validate,
  profileController.updateProfile.bind(profileController)
);

// Update avatar
router.patch(
  '/me/avatar',
  updateAvatarValidator,
  validate,
  profileController.updateAvatar.bind(profileController)
);

// Get user statistics
router.get('/me/stats', profileController.getUserStats.bind(profileController));

// Get achievements
router.get(
  '/me/achievements',
  profileController.getAchievements.bind(profileController)
);

// Get progress
router.get(
  '/me/progress',
  profileController.getUserProgress.bind(profileController)
);

// Update progress
router.post(
  '/me/progress',
  body('topic').notEmpty().withMessage('Topic is required'),
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  validate,
  profileController.updateProgress.bind(profileController)
);

// Get user content (notes/questions)
router.get('/me/content', profileController.getUserContent.bind(profileController));

// Get bookmarks
router.get('/me/bookmarks', profileController.getBookmarks.bind(profileController));

// Change password
router.post(
  '/me/change-password',
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  validate,
  profileController.changePassword.bind(profileController)
);

// Update settings
router.patch(
  '/me/settings',
  profileController.updateSettings.bind(profileController)
);

// Delete account
router.delete(
  '/me',
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  profileController.deleteAccount.bind(profileController)
);

export default router;