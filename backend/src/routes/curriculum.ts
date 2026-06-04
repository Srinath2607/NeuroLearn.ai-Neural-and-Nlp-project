import { Router } from 'express';
import { getCurriculum } from '../controllers/curriculumController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// @route   GET /api/curriculum
// @desc    Get dynamic curriculum based on user progress
router.get('/', getCurriculum);

export default router;
