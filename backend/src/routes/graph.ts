import { Router } from 'express';
import { getKnowledgeGraph } from '../controllers/graphController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// @route   GET /api/graph
// @desc    Get user's knowledge graph data
router.get('/', getKnowledgeGraph);

export default router;
