"use client";

import { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Brain, 
  Trophy, 
  Target,
  FileText,
  Loader2,
  BookOpen,
  CheckCircle2,
  MessageSquare
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/analytics", {
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
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg">
          <p className="font-medium text-sm mb-1 text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name === 'xp' ? 'XP: ' : ''}{entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-3xl font-bold">Analytics & Performance</h1>
        <p className="text-muted-foreground">Track your learning velocity and mastery progression over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-xl text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
            <p className="text-2xl font-bold">{data.summary.currentRank}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Study Time</p>
            <p className="text-2xl font-bold">{data.summary.totalStudyHours}h</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="p-4 bg-green-500/10 rounded-xl text-green-500">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Quizzes Taken</p>
            <p className="text-2xl font-bold">{data.summary.quizzesTaken}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="p-4 bg-accent/10 rounded-xl text-accent">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Docs Analyzed</p>
            <p className="text-2xl font-bold">{data.summary.documentsAnalyzed}</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* XP History (Line Chart) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                XP Progression
              </h3>
              <p className="text-sm text-muted-foreground">Your experience points earned over the last 7 days.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.xpHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Concept Mastery (Radar Chart) */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Concept Mastery
            </h3>
            <p className="text-sm text-muted-foreground">Strengths and weaknesses.</p>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.mastery}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time Distribution (Bar Chart) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Study Time by Subject
            </h3>
            <p className="text-sm text-muted-foreground">Hours dedicated to each topic.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studyTime} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} dx={-10} />
                <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Activity Log */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Detailed Activity Log
            </h3>
            <p className="text-sm text-muted-foreground">Your complete history of uploads, quizzes, and chats.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.summary.allActivity && data.summary.allActivity.length > 0 ? (
              data.summary.allActivity.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className={`p-2.5 rounded-xl bg-background border border-border`}>
                    {activity.type === 'doc' ? <BookOpen className="h-5 w-5 text-blue-500" /> : 
                     activity.type === 'quiz' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                     <MessageSquare className="h-5 w-5 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground italic">
                No activity history found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
