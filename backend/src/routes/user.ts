import { Router } from 'express';
import { updateProfile, updatePreferences, updatePassword } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// @route   PUT /api/user/profile
// @desc    Update user profile (name, bio, avatar)
router.put('/profile', updateProfile);

// @route   PUT /api/user/preferences
// @desc    Update user preferences
router.put('/preferences', updatePreferences);

// @route   PUT /api/user/password
// @desc    Update user password
router.put('/password', updatePassword);

export default router;
