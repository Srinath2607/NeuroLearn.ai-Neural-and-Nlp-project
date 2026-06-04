"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "What exactly is a 'Multi-Agent' system?",
      answer: "Instead of one generic AI trying to do everything, NeuroLearn uses multiple specialized AI agents. One agent handles conversations (Diagnostic), another processes images and documents (Vision), another maps your brain's understanding (Tracker), and a final one builds your syllabus (Curriculum). They work together seamlessly."
    },
    {
      question: "Can I upload my own class notes and syllabus?",
      answer: "Yes! You can upload PDFs, Word documents, and even photos of handwritten notes. The Vision Agent will extract the text and formulas, and the Tracker Agent will map them into your personalized knowledge graph."
    },
    {
      question: "How does the AI know my weaknesses?",
      answer: "As you interact with the Diagnostic Agent and take AI-generated quizzes, the system uses Graph Neural Networks (GCNs) to adjust the 'mastery weights' on your knowledge graph. If you consistently struggle with 'Backpropagation', it highlights it as a weakness and adapts the curriculum to focus more on prerequisite concepts like 'Chain Rule'."
    },
    {
      question: "What AI models power the platform?",
      answer: "We use a mix of state-of-the-art models depending on your plan. The core intelligence utilizes GPT-4 and Claude 3 for complex reasoning, Llama 3 for fast conversational tutoring, and specialized Vision Transformers (ViT) for diagram understanding."
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about NeuroLearn AI.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="border border-border bg-card rounded-2xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openIdx === idx ? "rotate-180" : ""}`} 
                />
              </button>
              
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
