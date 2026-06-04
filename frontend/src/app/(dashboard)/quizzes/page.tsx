"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  XCircle,
  Brain,
  ArrowRight,
  Trophy,
  Loader2,
  RefreshCw
} from "lucide-react";

// Mock quiz data structure for the UI
interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  _id: string;
  title: string;
  topic: string;
  status: 'pending' | 'completed';
  score?: number;
  questions: Question[];
  documentId?: string | { originalName: string };
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{score: number, xpGained: number} | null>(null);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/quiz", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const generateNewQuiz = async (topic: string) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/quiz/generate", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const newQuiz = await res.json();
        setQuizzes([newQuiz, ...quizzes]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const generateQuizzesFromDocs = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/quiz/generate-from-docs", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quizzes && data.quizzes.length > 0) {
          setQuizzes([...data.quizzes, ...quizzes]);
          alert(`Success! Generated ${data.quizzes.length} new quizzes from your uploaded notes.`);
        } else {
          alert("No new quizzes were generated. Make sure you have uploaded and processed notes that don't already have quizzes.");
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to generate quizzes from documents.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while connecting to the server.");
    } finally {
      setGenerating(false);
    }
  };

  const generateCombinedQuiz = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/quiz/generate-combined", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const newQuiz = await res.json();
        setQuizzes([newQuiz, ...quizzes]);
        alert("Success! Your Mastery Marathon quiz has been generated from all your notes.");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to generate combined quiz.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while connecting to the server.");
    } finally {
      setGenerating(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (activeQuiz && currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    
    // Format answers array
    const answers = Object.entries(selectedAnswers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex
    }));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/quiz/${activeQuiz._id}/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers })
      });
      
      if (res.ok) {
        const result = await res.json();
        setQuizScore(result);
        setQuizSubmitted(true);
        fetchQuizzes(); // Refresh list to update status
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
  };

  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === activeQuiz.questions.length - 1;
    const hasAnswered = selectedAnswers[question.id] !== undefined;

    return (
      <div className="max-w-3xl mx-auto py-8 flex flex-col min-h-[calc(100vh-10rem)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">{activeQuiz.title}</h2>
            <p className="text-muted-foreground">Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</p>
          </div>
          <button onClick={closeQuiz} className="px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 font-medium transition-colors">
            Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${(currentQuestionIdx / activeQuiz.questions.length) * 100}%` }}
            animate={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
          />
        </div>

        {!quizSubmitted ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h3 className="text-xl font-medium mb-6 leading-relaxed">{question.text}</h3>
              
              <div className="space-y-3">
                {question.options.map((opt: string, idx: number) => {
                  const isSelected = selectedAnswers[question.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(question.id, idx)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-sm" 
                          : "border-border hover:border-primary/50 bg-card hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                        <span className={isSelected ? "font-medium" : ""}>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Results View */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center text-center mt-8"
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
              <Trophy className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
            </div>
            
            <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-xl text-muted-foreground mb-8">
              You scored <span className="font-bold text-foreground">{quizScore?.score}%</span>
            </p>
            
            <div className="bg-card border border-border p-6 rounded-3xl w-full max-w-md shadow-sm mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground font-medium">XP Gained</span>
                <span className="font-bold text-primary text-xl">+{quizScore?.xpGained} XP</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-muted-foreground font-medium">Mastery Update</span>
                <div className="flex items-center gap-1 text-green-500 font-bold">
                  <ArrowRight className="h-4 w-4 -rotate-45" />
                  Increased
                </div>
              </div>
            </div>

            <button 
              onClick={closeQuiz}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {/* Navigation Footer */}
        {!quizSubmitted && (
          <div className="mt-auto pt-8 flex justify-end">
            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!hasAnswered}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-primary/25"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnswered}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
              >
                Next Question <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Dashboard / List View
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Adaptive Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and level up your mastery.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateQuizzesFromDocs}
            disabled={generating}
            className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
            {generating ? "Syncing..." : "Sync Quizzes from Notes"}
          </button>
          <button 
            onClick={() => generateNewQuiz("Neural Networks")}
            disabled={generating}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-70"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
            {generating ? "Generating..." : "Generate Custom Quiz"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mastery Marathon Card */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="inline-flex px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold mb-4">
                SMART COMBINE
              </div>
              <h3 className="text-xl font-bold mb-2">Mastery Marathon</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Ready for the ultimate challenge? Combine all your uploaded notes into one comprehensive 10-question quiz.
              </p>
            </div>
            <button 
              onClick={generateCombinedQuiz}
              disabled={generating}
              className="w-full py-2.5 bg-background border border-border rounded-xl font-semibold hover:border-primary transition-colors flex items-center justify-center gap-2 z-10 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Combined Quiz"} <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* User Quizzes */}
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-card border border-border rounded-3xl p-6 flex flex-col hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-secondary p-3 rounded-2xl text-primary">
                  {quiz.status === 'completed' ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <BookOpen className="h-6 w-6" />}
                </div>
                {quiz.status === 'completed' && (
                  <span className="font-bold text-lg text-green-500">{quiz.score}%</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Topic: {quiz.topic}
                {quiz.documentId && (
                  <span className="block mt-1 text-xs text-primary/70 italic">
                    Based on your notes: {typeof quiz.documentId === 'string' ? 'Uploaded Document' : (quiz.documentId as any).originalName || 'Uploaded Document'}
                  </span>
                )}
              </p>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-4">
                  <Brain className="h-4 w-4" />
                  {quiz.questions.length} Questions
                </div>
                
                {quiz.status === 'completed' ? (
                  <button className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-xl font-semibold opacity-70 cursor-default">
                    Completed
                  </button>
                ) : (
                  <button 
                    onClick={() => startQuiz(quiz)}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="h-5 w-5" /> Start Quiz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
