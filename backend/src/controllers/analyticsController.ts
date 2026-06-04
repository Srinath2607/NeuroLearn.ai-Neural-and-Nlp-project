import { Request, Response } from 'express';
import Document from '../models/Document';
import Quiz from '../models/Quiz';
import Chat from '../models/Chat';
import User from '../models/User';

export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // 1. Fetch real counts and data
    const docCount = await Document.countDocuments({ userId, status: 'completed' });
    const quizCount = await Quiz.countDocuments({ userId, status: 'completed' });
    const user = await User.findById(userId);
    
    // 2. Fetch Recent Activity
    const recentDocs = await Document.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const recentQuizzes = await Quiz.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const recentChats = await Chat.find({ userId }).sort({ createdAt: -1 }).limit(10);

    // 2.5 Fetch "Up Next" Recommendation
    // We recommend the most recent document that hasn't been quizzed yet, or the very latest document
    const latestDoc = await Document.findOne({ userId, status: 'completed' }).sort({ createdAt: -1 });
    let upNext = null;

    if (latestDoc) {
      const associatedQuiz = await Quiz.findOne({ userId, documentId: latestDoc._id });
      upNext = {
        title: latestDoc.originalName.replace(/\.[^/.]+$/, ""),
        id: latestDoc._id,
        type: 'document',
        description: associatedQuiz && associatedQuiz.status === 'completed' 
          ? `You mastered this topic with a score of ${associatedQuiz.score}%. Ready for a deep dive review?`
          : "Your Curriculum Agent recommends starting a study session for this newly uploaded document.",
        tag: "NEW CONTENT"
      };
    }

    const activities = [
      ...recentDocs.map(d => ({ title: `Uploaded: ${d.originalName}`, time: d.createdAt, type: 'doc' })),
      ...recentQuizzes.map(q => ({ title: `Completed Quiz: ${q.title}`, time: q.createdAt, type: 'quiz' })),
      ...recentChats.map(c => ({ title: `Chat Session: ${c.title || 'AI Tutor'}`, time: c.createdAt, type: 'chat' }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime());

    const limitedActivities = activities.slice(0, 4);
    const allActivities = activities.slice(0, 20);

    // 3. Format activity times (human readable)
    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);

      if (mins < 60) return `${mins} mins ago`;
      if (hours < 24) return `${hours} hours ago`;
      return `${days} days ago`;
    };

    const formattedRecentActivities = limitedActivities.map(a => ({
      title: a.title,
      time: formatTime(a.time),
      type: a.type
    }));

    const formattedAllActivities = allActivities.map(a => ({
      title: a.title,
      time: formatTime(a.time),
      type: a.type
    }));

    const responseData = {
      // XP Progression (Partially dynamic based on user level)
      xpHistory: [
        { name: 'Mon', xp: (user?.xp || 0) * 0.4 },
        { name: 'Tue', xp: (user?.xp || 0) * 0.5 },
        { name: 'Wed', xp: (user?.xp || 0) * 0.6 },
        { name: 'Thu', xp: (user?.xp || 0) * 0.7 },
        { name: 'Fri', xp: (user?.xp || 0) * 0.8 },
        { name: 'Sat', xp: (user?.xp || 0) * 0.9 },
        { name: 'Sun', xp: (user?.xp || 0) }
      ],
      studyTime: [
        { subject: 'Neural Nets', hours: Math.floor(docCount * 1.5) },
        { subject: 'Optimization', hours: Math.floor(quizCount * 0.8) },
        { subject: 'Calculus', hours: 5 },
        { subject: 'Linear Algebra', hours: 3 }
      ],
      mastery: [
        { subject: 'Neural Networks', A: 85, fullMark: 100 },
        { subject: 'Optimization', A: 72, fullMark: 100 },
        { subject: 'Linear Algebra', A: 90, fullMark: 100 },
        { subject: 'Calculus', A: 65, fullMark: 100 }
      ],
      summary: {
        totalStudyHours: Math.floor((docCount * 2) + (quizCount * 0.5)),
        quizzesTaken: quizCount,
        documentsAnalyzed: docCount,
        currentRank: (user?.level || 1) > 5 ? 'Gold II' : 'Bronze I',
        recentActivity: formattedRecentActivities,
        allActivity: formattedAllActivities,
        upNext: upNext
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
