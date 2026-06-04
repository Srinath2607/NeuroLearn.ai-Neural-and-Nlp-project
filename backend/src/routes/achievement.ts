import { Router } from 'express';
import { getAchievements } from '../controllers/achievementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// @route   GET /api/achievements
// @desc    Get user achievements and leaderboard
router.get('/', getAchievements);

export default router;
