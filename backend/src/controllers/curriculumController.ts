import { Request, Response } from 'express';
import Document from '../models/Document';
import Quiz from '../models/Quiz';
import Chat from '../models/Chat';

export const getCurriculum = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // 1. Fetch data from all sections
    const documents = await Document.find({ userId, status: 'completed' });
    const quizzes = await Quiz.find({ userId });
    const chats = await Chat.find({ userId });

    // 2. Build dynamic curriculum steps
    const steps = [];

    // Step 1: Base Step (Always present)
    steps.push({
      id: 'base-1',
      title: 'Forward Pass Fundamentals',
      description: 'Understanding how data flows through a neural network from inputs to predictions.',
      status: 'completed',
      type: 'foundation'
    });

    // Step 2: Dynamic Step based on Documents
    if (documents.length > 0) {
      steps.push({
        id: 'doc-1',
        title: `Deep Dive: ${documents[0].originalName}`,
        description: 'Analyzing your uploaded material for core architectural insights.',
        status: 'completed',
        type: 'upload',
        docId: documents[0]._id,
        previewText: documents[0].extractedText?.substring(0, 150) + '...',
        fullText: documents[0].extractedText,
        formulas: documents[0].formulas
      });
    }

    // Step 3: Current Focus (In Progress)
    // If there are quizzes pending or if user just uploaded something
    const latestDoc = documents.length > 1 ? documents[1] : (documents.length > 0 ? documents[0] : null);
    
    steps.push({
      id: 'focus-1',
      title: latestDoc ? `Mastery: ${latestDoc.originalName}` : 'Getting Started',
      description: latestDoc ? 'Testing your knowledge on the latest material you uploaded.' : 'Upload your first study material to generate a custom learning path.',
      status: 'in_progress',
      type: 'quiz',
      docId: latestDoc?._id,
      previewText: latestDoc?.extractedText ? latestDoc.extractedText.substring(0, 150) + '...' : undefined,
      fullText: latestDoc?.extractedText,
      formulas: latestDoc?.formulas
    });

    // Step 4: Future steps (Mocked for continuity)
    steps.push({
      id: 'future-1',
      title: 'Advanced Optimizers',
      description: 'Exploring Adam, RMSProp, and beyond for faster convergence.',
      status: 'locked',
      type: 'advanced'
    });

    res.status(200).json(steps);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
