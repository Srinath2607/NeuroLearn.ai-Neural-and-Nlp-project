import { Request, Response } from 'express';

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Mock data for achievements and leaderboard
    const mockData = {
      badges: [
        { id: '1', title: 'First Steps', description: 'Complete your first chat session.', icon: 'Baby', unlocked: false, progress: 0, total: 1 },
        { id: '2', title: 'Quiz Master', description: 'Score 100% on 5 quizzes.', icon: 'Award', unlocked: false, progress: 0, total: 5 },
        { id: '3', title: 'Visionary', description: 'Upload and analyze 10 documents.', icon: 'Eye', unlocked: false, progress: 0, total: 10 },
        { id: '4', title: 'Streak King', description: 'Maintain a 7-day study streak.', icon: 'Flame', unlocked: false, progress: 0, total: 7 },
        { id: '5', title: 'Polymath', description: 'Master concepts in 3 different subjects.', icon: 'BrainCircuit', unlocked: false, progress: 0, total: 3 },
        { id: '6', title: 'Night Owl', description: 'Complete a study session after midnight.', icon: 'Moon', unlocked: false, progress: 0, total: 1 }
      ],
      leaderboard: [
        { rank: 1, name: 'Alex M.', xp: 3450, isUser: false, avatar: 'A' },
        { rank: 2, name: 'Sarah J.', xp: 3120, isUser: false, avatar: 'S' },
        { rank: 3, name: 'David K.', xp: 2750, isUser: false, avatar: 'D' },
        { rank: 4, name: 'Emma T.', xp: 2100, isUser: false, avatar: 'E' },
        { rank: 5, name: 'You', xp: 0, isUser: true, avatar: 'U' }, // Mocking the current user starting fresh
      ],
      userStats: {
        totalXp: 0,
        level: 1,
        rank: 'Novice',
        nextRankXp: 100
      }
    };

    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
