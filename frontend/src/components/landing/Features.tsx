"use client";

import { motion, Variants } from "framer-motion";
import { Brain, Network, Zap, Eye, Trophy, Layers } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Diagnostic AI Agent",
      description: "Conversational tutor that uses RAG to ground its answers in your verified syllabus.",
      icon: <Brain className="h-6 w-6" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Vision & OCR Agent",
      description: "Upload handwritten notes or engineering diagrams. Our vision models extract formulas and concepts instantly.",
      icon: <Eye className="h-6 w-6" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Knowledge Graph Tracking",
      description: "Visualize your understanding with GCNs mapping your mastery across interconnected concepts.",
      icon: <Network className="h-6 w-6" />,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Adaptive Curriculum",
      description: "Reinforcement learning continuously adapts your learning path based on quiz performance.",
      icon: <Zap className="h-6 w-6" />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Gamified Progression",
      description: "Earn XP, maintain streaks, and unlock achievements as you master difficult subjects.",
      icon: <Trophy className="h-6 w-6" />,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Multi-Modal Learning",
      description: "Combine text, vision, code blocks, and interactive graphs in a unified study environment.",
      icon: <Layers className="h-6 w-6" />,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Four Agents. <span className="gradient-text">One Goal.</span></h2>
          <p className="text-lg text-muted-foreground">
            Our multi-agent orchestration system divides complex educational tasks among specialized AI models to provide an unmatched tutoring experience.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={item}
              className="group glass p-8 rounded-2xl hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-${feature.color.split('-')[1]}-500/10 rounded-bl-full -z-10 transition-all duration-500 group-hover:scale-150`} />
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
