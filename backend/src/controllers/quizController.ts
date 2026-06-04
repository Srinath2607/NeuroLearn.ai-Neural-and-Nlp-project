import { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import User from '../models/User';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const quizzes = await Quiz.find({ 
      userId,
      title: { $not: /chain rule/i } // Exclude mock chain rule quizzes
    })
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

import Document from '../models/Document';

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { topic } = req.body;

    // Find a relevant document for the user to provide context (latest one as fallback)
    let contextText = undefined;
    const latestDoc = await Document.findOne({ userId, extractedText: { $exists: true, $ne: '' } }).sort({ createdAt: -1 });
    
    if (latestDoc && latestDoc.extractedText) {
      contextText = latestDoc.extractedText;
    }

    // Call AI service to generate a dynamic quiz
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/quiz/generate`, {
      topic: topic || 'General AI',
      contextText: contextText
    });

    const quizData = aiResponse.data.quiz;

    const newQuiz = new Quiz({
      userId,
      title: quizData.title,
      topic: quizData.topic,
      questions: quizData.questions,
      status: 'pending'
    });

    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateQuizzesFromDocs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Find all documents with extracted text
    const documents = await Document.find({ 
      userId, 
      extractedText: { $exists: true, $ne: '' },
      status: 'completed'
    });

    if (documents.length === 0) {
      return res.status(400).json({ error: 'No processed documents found to generate quizzes from.' });
    }

    const generatedQuizzes = [];

    for (const doc of documents) {
      // Check if a quiz already exists for this document
      const existingQuiz = await Quiz.findOne({ userId, documentId: doc._id });
      if (existingQuiz) continue;

      try {
        // Call AI service to generate a quiz for this specific document
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/quiz/generate`, {
          topic: doc.originalName.replace(/\.[^/.]+$/, ""), // Use filename as topic
          contextText: doc.extractedText
        });

        const quizData = aiResponse.data.quiz;

        const newQuiz = new Quiz({
          userId,
          title: quizData.title,
          topic: quizData.topic,
          documentId: doc._id,
          questions: quizData.questions,
          status: 'pending'
        });

        await newQuiz.save();
        generatedQuizzes.push(newQuiz);
      } catch (err) {
        console.error(`Failed to generate quiz for document ${doc._id}:`, err);
      }
    }

    res.status(201).json({
      message: `Generated ${generatedQuizzes.length} new quizzes.`,
      quizzes: generatedQuizzes
    });
  } catch (error) {
    console.error('Error generating quizzes from documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateCombinedQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // 1. Get all completed documents for this user
    const documents = await Document.find({ 
      userId, 
      status: 'completed',
      extractedText: { $exists: true, $ne: '' }
    });

    if (documents.length === 0) {
      return res.status(400).json({ error: 'No processed notes found. Upload some PDFs first!' });
    }

    // 2. Combine summaries (limited to avoid token overflow)
    const combinedContext = documents
      .map(doc => `--- FROM DOCUMENT: ${doc.originalName} ---\n${doc.extractedText}`)
      .join('\n\n')
      .substring(0, 25000); // AI Service will handle further trimming if needed

    // 3. Request a comprehensive quiz from AI
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/quiz/generate`, {
      topic: "Mastery Marathon (All Uploaded Notes)",
      contextText: combinedContext
    });

    const quizData = aiResponse.data.quiz;

    // 4. Save as a special "Combined" quiz
    const newQuiz = new Quiz({
      userId,
      title: "Mastery Marathon",
      topic: "Comprehensive Review",
      questions: quizData.questions,
      status: 'pending'
    });

    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error generating combined quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { answers } = req.body; // array of { questionId, selectedIndex }

    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.status === 'completed') {
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    let correctCount = 0;
    
    // Simple grading logic
    answers.forEach((ans: any) => {
      const question = quiz.questions.find(q => q.id === ans.questionId);
      if (question && question.correctOptionIndex === ans.selectedIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    quiz.score = score;
    quiz.status = 'completed';
    quiz.completedAt = new Date();
    await quiz.save();

    // Reward user with XP
    const user = await User.findById(userId);
    if (user) {
      user.xp += score; // Award XP based on score
      if (user.xp >= 250) {
        user.level += 1;
        user.xp = user.xp - 250;
      }
      await user.save();
    }

    res.status(200).json({
      message: 'Quiz submitted successfully',
      score,
      xpGained: score
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
