import { Request, Response } from 'express';
import Chat from '../models/Chat';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const createChat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, agentType } = req.body;

    const newChat = new Chat({
      userId,
      title: title || 'New Conversation',
      messages: [],
      agentType: agentType || 'diagnostic'
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const chats = await Chat.find({ userId }).select('-messages').sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChatById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { message } = req.body;
    const chatId = req.params.id;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    await chat.save();

    // Call AI Service (FastAPI)
    try {
      // In a real implementation, we'd use WebSockets for streaming
      // For now, we do a simple HTTP POST to our AI service
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/chat`, {
        message,
        history: chat.messages.slice(-5) // Send last 5 messages for context
      });

      const replyContent = aiResponse.data.reply;

      chat.messages.push({
        role: 'assistant',
        content: replyContent,
        timestamp: new Date()
      });

      await chat.save();
      
      res.status(200).json({
        reply: replyContent,
        chat
      });
    } catch (aiError) {
      console.error('AI Service error:', aiError);
      res.status(503).json({ error: 'AI Service is temporarily unavailable' });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
