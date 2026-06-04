"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, TrendingUp } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Upload Your Materials",
      description: "Drop your PDFs, syllabi, and handwritten notes. Our Vision Agent parses everything into a structured knowledge base.",
      icon: <Upload className="h-8 w-8 text-primary" />,
    },
    {
      title: "AI Analysis & Mapping",
      description: "The Tracker Agent maps concepts into a Knowledge Graph, identifying prerequisite dependencies and generating a custom curriculum.",
      icon: <Cpu className="h-8 w-8 text-accent" />,
    },
    {
      title: "Learn & Adapt",
      description: "Chat with the Diagnostic Agent. As you take quizzes, the Curriculum Agent uses RL to adjust your path in real-time.",
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/50 relative border-y border-border overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            From raw notes to absolute mastery in three simple steps.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-primary via-accent to-green-500 z-0 opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-24 h-24 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center mb-6 relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold shadow-sm">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
