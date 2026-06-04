import { Router } from 'express';
import { createChat, getChats, getChatById, sendMessage } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// @route   POST /api/chat
// @desc    Create a new chat session
router.post('/', createChat);

// @route   GET /api/chat
// @desc    Get all chats for user
router.get('/', getChats);

// @route   GET /api/chat/:id
// @desc    Get specific chat by ID
router.get('/:id', getChatById);

// @route   POST /api/chat/:id/message
// @desc    Send message to chat
router.post('/:id/message', sendMessage);

export default router;
