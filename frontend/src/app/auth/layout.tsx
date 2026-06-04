import Link from "next/link";
import { Brain } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Animated Background (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-between overflow-hidden">
        {/* Particle/Gradient effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="p-12 relative z-10 flex flex-col h-full justify-between">
          <Link href="/" className="flex items-center gap-2 group w-fit text-primary-foreground">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Brain className="h-8 w-8" />
            </div>
            <span className="font-bold text-2xl tracking-tight">NeuroLearn<span className="text-white/70">.ai</span></span>
          </Link>

          <div className="text-primary-foreground mt-auto">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Master complex topics <br />with AI-driven <br />personalized paths.
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Join thousands of students using multi-agent technology to learn 10x faster and retain knowledge permanently.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="lg:hidden flex items-center gap-2 mb-8 group w-fit">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">NeuroLearn<span className="text-primary">.ai</span></span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
