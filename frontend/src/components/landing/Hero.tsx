"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, BrainCircuit, LayoutDashboard, MessageSquare, FileText, Network, Award, Flame } from "lucide-react";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple floating particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: {x: number, y: number, radius: number, vx: number, vy: number}[] = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }
    
    let animationFrameId: number;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(120, 120, 255, 0.5)';
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Connect near particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120, 120, 255, ${0.2 * (1 - dist/100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background elements */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border backdrop-blur-sm text-sm font-medium mb-8"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Introducing Multi-Agent AI Tutors</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight"
        >
          The Future of <span className="gradient-text">Adaptive</span> Learning is Here
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          NeuroLearn AI uses advanced multi-agent architecture to create a truly personalized learning journey, adapting to your strengths, weaknesses, and pace in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signup"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            Start Learning Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border border-border px-8 py-4 rounded-full text-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            <BrainCircuit className="h-5 w-5" />
            See How It Works
          </Link>
        </motion.div>

        {/* Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 md:mt-24 relative mx-auto max-w-5xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 bottom-0 h-full pointer-events-none" />
          <div className="glass rounded-2xl border border-border/50 shadow-2xl overflow-hidden p-2 bg-card/50 backdrop-blur-xl">
            <div className="bg-background rounded-xl overflow-hidden border border-border flex aspect-video">
              {/* Left Sidebar */}
              <div className="w-1/5 border-r border-border/85 hidden lg:flex flex-col p-4 gap-3 bg-secondary/10">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm tracking-tight">NeuroLearn.ai</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-xs font-medium transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                    AI Tutors
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-xs font-medium transition-colors">
                    <FileText className="h-3.5 w-3.5" />
                    Vision Agent
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-xs font-medium transition-colors">
                    <Network className="h-3.5 w-3.5" />
                    Knowledge Graph
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-xs font-medium transition-colors">
                    <Award className="h-3.5 w-3.5" />
                    Quizzes
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border/65 flex items-center gap-2 px-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">AM</div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold">Alex Morgan</span>
                    <span className="text-[8px] text-muted-foreground">Lvl 4 Student</span>
                  </div>
                </div>
              </div>
              
              {/* Main Dashboard Preview Content */}
              <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden bg-background">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="text-left">
                    <h4 className="text-sm font-bold">Welcome back, Alex! 👋</h4>
                    <p className="text-[10px] text-muted-foreground">Your diagnostic path is 82% complete today.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 text-orange-500 text-[9px] font-bold">
                      <Flame className="h-3 w-3" />
                      5 Day Streak
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-[9px] font-bold">
                      <Award className="h-3 w-3" />
                      1,420 XP
                    </div>
                  </div>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  {/* Left Column: Chat agent mockup */}
                  <div className="md:col-span-2 flex flex-col border border-border/60 rounded-xl p-3 bg-secondary/5 relative overflow-hidden">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold text-left">Diagnostic Agent Session</span>
                    </div>
                    
                    {/* Fake Chat Message History */}
                    <div className="space-y-3 text-left overflow-y-auto max-h-[160px] pr-1">
                      <div className="bg-secondary/20 p-2 rounded-lg text-[9px] max-w-[85%]">
                        <span className="font-semibold text-primary block mb-0.5">Alex Morgan:</span>
                        Can you explain how the backpropagation algorithm uses the chain rule to update weights?
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-2 rounded-lg text-[9px] max-w-[90%] ml-auto">
                        <span className="font-semibold text-accent block mb-0.5">Diagnostic AI Agent:</span>
                        {"Certainly! In a neural network, to compute the gradient of the loss function $L$ with respect to a weight $w_{ij}$, we apply the chain rule:"}
                        <div className="my-1 text-center font-mono text-[8px] text-primary">
                          {"$$\\frac{\\partial L}{\\partial w_{ij}} = \\frac{\\partial L}{\\partial a_j} \\cdot \\frac{\\partial a_j}{\\partial z_j} \\cdot \\frac{\\partial z_j}{\\partial w_{ij}}$$"}
                        </div>
                        {"Here, $z_j$ is the net input, and $a_j$ is the activation of neuron $j$. This propagates error gradients backward!"}
                      </div>
                    </div>
                    
                    {/* Mock Chat input bar */}
                    <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                      <div className="text-[9px] text-muted-foreground/80 px-2 py-1.5 bg-background border border-border rounded-lg flex-1 text-left">
                        Ask about gradients, vectors, or upload a note...
                      </div>
                      <div className="px-2.5 py-1.5 bg-primary text-white rounded-lg text-[9px] font-bold">Send</div>
                    </div>
                  </div>

                  {/* Right Column: Knowledge Node Mastery and stats */}
                  <div className="flex flex-col gap-3">
                    {/* Mastery Node */}
                    <div className="border border-border/60 rounded-xl p-3 bg-secondary/5 flex flex-col text-left">
                      <span className="text-[10px] font-bold mb-2">Active Topic Mastery</span>
                      <div className="flex items-center gap-3">
                        {/* Circular Progress SVG */}
                        <div className="relative w-10 h-10">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-secondary" />
                            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary" strokeDasharray="100" strokeDashoffset="25" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">75%</div>
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold block">Backpropagation</span>
                          <span className="text-[8px] text-muted-foreground">Up next: Optimization Algorithms</span>
                        </div>
                      </div>
                    </div>

                    {/* Knowledge Graph node visualization */}
                    <div className="border border-border/60 rounded-xl p-3 bg-secondary/5 flex-1 flex flex-col text-left relative overflow-hidden">
                      <span className="text-[10px] font-bold mb-2">Knowledge Graph Map</span>
                      {/* Interactive looking vector mesh layout using SVG */}
                      <svg className="w-full h-full min-h-[70px] opacity-75" viewBox="0 0 100 60">
                        {/* Lines */}
                        <line x1="20" y1="30" x2="50" y2="15" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/35" />
                        <line x1="20" y1="30" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/35" />
                        <line x1="50" y1="15" x2="80" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/35" />
                        <line x1="50" y1="45" x2="80" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/35" />
                        {/* Nodes */}
                        <circle cx="20" cy="30" r="3.5" className="fill-primary" />
                        <circle cx="50" cy="15" r="3.5" className="fill-accent" />
                        <circle cx="50" cy="45" r="3.5" className="fill-primary" />
                        <circle cx="80" cy="30" r="3.5" className="fill-secondary-foreground/20 stroke-muted-foreground/50" />
                        {/* Text */}
                        <text x="15" y="24" className="text-[5px] fill-foreground font-semibold">Chain Rule</text>
                        <text x="43" y="9" className="text-[5px] fill-foreground font-semibold">Gradients</text>
                        <text x="43" y="52" className="text-[5px] fill-foreground font-semibold">Jacobians</text>
                        <text x="73" y="24" className="text-[5px] fill-muted-foreground">Backprop</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
