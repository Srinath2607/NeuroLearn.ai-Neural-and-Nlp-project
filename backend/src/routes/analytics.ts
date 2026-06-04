import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// @route   GET /api/analytics
// @desc    Get aggregated analytics data for the user
router.get('/', getAnalyticsData);

export default router;
