"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  Award, 
  Baby, 
  Eye, 
  Flame, 
  BrainCircuit, 
  Moon,
  Star,
  Lock,
  Loader2
} from "lucide-react";

const IconMap: any = {
  Baby, Award, Eye, Flame, BrainCircuit, Moon
};

export default function AchievementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/achievements", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Achievements & Leaderboard</h1>
        <p className="text-muted-foreground">Track your milestones and see how you rank against other learners.</p>
      </div>

      {/* Top Section: User Rank & Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center bg-card shadow-xl relative">
              <Medal className="h-16 w-16 text-yellow-500" />
              <div className="absolute -bottom-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                Level {data.userStats.level}
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Current Rank</h2>
              <h3 className="text-4xl font-extrabold mb-4">{data.userStats.rank}</h3>
              
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>{data.userStats.totalXp} XP</span>
                  <span className="text-muted-foreground">Next: {data.userStats.nextRankXp} XP</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden border border-border/50">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.userStats.totalXp / data.userStats.nextRankXp) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Snapshot */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-bold">Global Leaderboard</h3>
          </div>
          
          <div className="flex-1 space-y-3">
            {data.leaderboard.map((user: any, idx: number) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  user.isUser ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold w-4 text-center ${
                    idx === 0 ? "text-yellow-500" : 
                    idx === 1 ? "text-slate-400" : 
                    idx === 2 ? "text-amber-700" : "text-muted-foreground"
                  }`}>
                    {user.rank}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    user.isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {user.avatar}
                  </div>
                  <span className={`font-medium ${user.isUser ? "text-primary" : ""}`}>
                    {user.name}
                  </span>
                </div>
                <span className="text-sm font-bold">{user.xp} XP</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl font-medium transition-colors">
            View Full Rankings
          </button>
        </div>
      </div>

      {/* Badges & Milestones */}
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-accent" />
          Your Badges
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.badges.map((badge: any) => {
            const Icon = IconMap[badge.icon] || Award;
            
            return (
              <motion.div 
                key={badge.id}
                whileHover={{ y: -2 }}
                className={`border rounded-3xl p-6 flex items-start gap-4 transition-all ${
                  badge.unlocked 
                    ? "bg-card border-border hover:border-primary/30 hover:shadow-md" 
                    : "bg-secondary/30 border-transparent opacity-70 grayscale"
                }`}
              >
                <div className={`p-4 rounded-2xl shrink-0 relative ${
                  badge.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-8 w-8" />
                  {!badge.unlocked && (
                    <div className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-sm">
                      <Lock className="h-3 w-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg mb-1 truncate">{badge.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {badge.description}
                  </p>
                  
                  {badge.unlocked ? (
                    <div className="text-xs font-medium text-green-500 bg-green-500/10 inline-flex px-2 py-1 rounded-md">
                      Unlocked {badge.date}
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{badge.progress} / {badge.total}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-muted-foreground/50"
                          style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
