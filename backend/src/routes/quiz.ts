import { Router } from 'express';
import { getQuizzes, generateQuiz, generateQuizzesFromDocs, generateCombinedQuiz, submitQuiz } from '../controllers/quizController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// @route   GET /api/quiz
// @desc    Get user's quizzes
router.get('/', getQuizzes);

// @route   POST /api/quiz/generate
// @desc    Generate a new adaptive quiz
router.post('/generate', generateQuiz);

// @route   POST /api/quiz/generate-from-docs
// @desc    Generate quizzes for all uploaded documents
router.post('/generate-from-docs', generateQuizzesFromDocs);

// @route   POST /api/quiz/generate-combined
// @desc    Generate a comprehensive quiz from all documents
router.post('/generate-combined', generateCombinedQuiz);

// @route   POST /api/quiz/:id/submit
// @desc    Submit quiz answers and get score
router.post('/:id/submit', submitQuiz);

export default router;
