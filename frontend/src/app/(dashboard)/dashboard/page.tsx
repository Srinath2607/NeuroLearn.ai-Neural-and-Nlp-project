"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Flame, 
  Target, 
  Brain, 
  Clock, 
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Network,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/analytics", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setAnalytics(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { label: "Current Streak", value: `${user?.streak || 3} Days`, icon: <Flame className="h-5 w-5 text-orange-500" />, color: "bg-orange-500/10" },
    { label: "Concepts Mastered", value: analytics ? analytics.mastery.length.toString() : "0", icon: <Brain className="h-5 w-5 text-primary" />, color: "bg-primary/10" },
    { label: "Study Time", value: analytics ? `${analytics.summary.totalStudyHours}h` : "0h", icon: <Clock className="h-5 w-5 text-blue-500" />, color: "bg-blue-500/10" },
    { label: "Quizzes Taken", value: analytics ? analytics.summary.quizzesTaken.toString() : "0", icon: <Target className="h-5 w-5 text-green-500" />, color: "bg-green-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 relative overflow-hidden border border-border"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Your Diagnostic Agent has prepared your learning path for today.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-border">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium">Current Level</span>
              <span className="text-2xl font-bold">Lvl {user?.level || 1}</span>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium">XP to next</span>
              <span className="text-2xl font-bold text-primary">{250 - (user?.xp || 120)}</span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-secondary flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
                <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray="163" strokeDashoffset={163 - (163 * ((user?.xp || 120) / 250))} />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Recommended Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Up Next For You
          </h2>
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="h-32 w-full md:w-48 bg-secondary rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-0" />
              <Network className="h-10 w-10 text-primary z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="inline-flex px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-bold w-fit mb-1 uppercase">
                {analytics?.summary?.upNext?.tag || "MACHINE LEARNING"}
              </div>
              <h3 className="text-2xl font-bold">{analytics?.summary?.upNext?.title || "Understanding Backpropagation"}</h3>
              <p className="text-muted-foreground">
                {analytics?.summary?.upNext?.description || "Your Curriculum Agent noticed you struggled with Chain Rule in the last quiz. Let's master Backpropagation with a visual interactive session."}
              </p>
              <div className="mt-4 flex gap-3">
                <Link 
                  href={analytics?.summary?.upNext?.id ? `/chat?docId=${analytics.summary.upNext.id}` : "/chat"} 
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Start Session <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/graph" className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-secondary/80 transition-colors">
                  View Graph
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </h2>
          <div className="bg-card border border-border rounded-3xl p-6 flex-1">
            <div className="space-y-6">
              {analytics?.summary?.recentActivity?.length > 0 ? (
                analytics.summary.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      {activity.type === 'doc' ? <BookOpen className="h-5 w-5 text-blue-500" /> : 
                       activity.type === 'quiz' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                       <MessageSquare className="h-5 w-5 text-accent" />}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-10">No recent activity yet. Start by uploading a document!</p>
              )}
            </div>
            <button 
              onClick={() => router.push('/analytics')}
              className="w-full mt-6 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              View All Activity
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
