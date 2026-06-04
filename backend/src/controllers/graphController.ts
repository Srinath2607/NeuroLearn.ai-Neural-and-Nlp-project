import { Request, Response } from 'express';
import Document from '../models/Document';
import Quiz from '../models/Quiz';
import Chat from '../models/Chat';

export const getKnowledgeGraph = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // 1. Fetch real user data
    const documents = await Document.find({ userId, status: 'completed' });
    const quizzes = await Quiz.find({ userId, status: 'completed' });
    const chats = await Chat.find({ userId });

    // 2. Build dynamic nodes based on user activity
    const nodes: any[] = [];
    const edges: any[] = [];

    // Base Center Node
    nodes.push({ 
      id: 'root', 
      position: { x: 400, y: 300 }, 
      data: { label: 'My Knowledge', mastery: 100 }, 
      type: 'conceptNode' 
    });

    // Add Nodes for Documents (Uploads & Notes)
    documents.forEach((doc, index) => {
      const angle = (index / (documents.length || 1)) * 2 * Math.PI;
      const radius = 200;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);
      
      const docId = `doc-${doc._id}`;
      
      // Calculate mastery based on quizzes linked to this document
      const docQuizzes = quizzes.filter(q => q.documentId?.toString() === doc._id.toString());
      const averageScore = docQuizzes.length > 0 
        ? docQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / docQuizzes.length 
        : 0;

      nodes.push({
        id: docId,
        position: { x, y },
        data: { 
          label: doc.originalName.replace(/\.[^/.]+$/, ""), 
          mastery: Math.round(averageScore) 
        },
        type: 'conceptNode'
      });

      edges.push({
        id: `e-root-${docId}`,
        source: 'root',
        target: docId,
        animated: averageScore < 50
      });
    });

    // Add Nodes for Quizzes (not linked to docs)
    const independentQuizzes = quizzes.filter(q => !q.documentId && !q.title.toLowerCase().includes('chain rule'));
    independentQuizzes.forEach((quiz, index) => {
      const angle = ((index + documents.length) / (documents.length + independentQuizzes.length || 1)) * 2 * Math.PI;
      const radius = 350;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);
      
      const quizId = `quiz-${quiz._id}`;

      nodes.push({
        id: quizId,
        position: { x, y },
        data: { 
          label: quiz.title, 
          mastery: quiz.score || 0 
        },
        type: 'conceptNode'
      });

      edges.push({
        id: `e-root-${quizId}`,
        source: 'root',
        target: quizId,
        animated: (quiz.score || 0) < 80
      });
    });

    // 3. Fallback if empty
    if (nodes.length === 1) {
      nodes.push({ 
        id: 'start', 
        position: { x: 600, y: 300 }, 
        data: { label: 'Upload Notes to Start', mastery: 0 }, 
        type: 'conceptNode' 
      });
      edges.push({ id: 'e-root-start', source: 'root', target: 'start', animated: true });
    }

    res.status(200).json({ nodes, edges });
  } catch (error) {
    console.error('Error getting graph:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
