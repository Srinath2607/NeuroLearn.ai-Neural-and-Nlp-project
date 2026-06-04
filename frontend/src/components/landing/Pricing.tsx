"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for casual learners.",
      features: [
        "Diagnostic Agent (Llama 3)",
        "Basic Knowledge Graph",
        "Up to 5 Document Uploads/mo",
        "Community Support",
      ],
      highlighted: false,
      cta: "Get Started Free",
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For serious students and lifelong learners.",
      features: [
        "Advanced Diagnostic Agent (GPT-4 / Claude)",
        "Vision Agent & OCR processing",
        "Unlimited Document Uploads",
        "Adaptive RL Curriculum Paths",
        "Detailed Analytics Dashboard",
        "Priority Support",
      ],
      highlighted: true,
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For institutions and study groups.",
      features: [
        "Everything in Pro",
        "Custom Fine-tuned Models",
        "Team Analytics & Dashboards",
        "SSO & Advanced Security",
        "Dedicated Success Manager",
      ],
      highlighted: false,
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Invest in your education. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-3xl p-8 relative ${
                plan.highlighted 
                  ? "bg-gradient-to-b from-primary/10 to-transparent border border-primary shadow-2xl scale-100 md:scale-105 z-10" 
                  : "bg-card border border-border shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
              
              <div className="mb-8 flex items-end gap-1">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground mb-2">{plan.period}</span>}
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/auth/signup"
                className={`w-full py-4 rounded-xl font-bold transition-all text-center block ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
