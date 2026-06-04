"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { 
  Brain, 
  MessageSquare, 
  Network, 
  Target, 
  FileText, 
  BarChart2, 
  Upload, 
  Trophy, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: <Target className="h-5 w-5" /> },
    { name: "AI Tutor", href: "/chat", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Knowledge Graph", href: "/graph", icon: <Network className="h-5 w-5" /> },
    { name: "Learning Path", href: "/curriculum", icon: <Brain className="h-5 w-5" /> },
    { name: "Quizzes", href: "/quizzes", icon: <FileText className="h-5 w-5" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { name: "Uploads & Notes", href: "/uploads", icon: <Upload className="h-5 w-5" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-5 w-5" /> },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-border bg-card/50 backdrop-blur-xl ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link href="/dashboard" className={`flex items-center gap-2 overflow-hidden ${!sidebarOpen && "justify-center w-full"}`}>
          <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg whitespace-nowrap">NeuroLearn.ai</span>}
        </Link>
      </div>

      <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-4">
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${!sidebarOpen && "justify-center"}`}
                title={!sidebarOpen ? item.name : ""}
              >
                <div className={`${isActive ? "text-primary-foreground" : "group-hover:text-primary"}`}>
                  {item.icon}
                </div>
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-auto space-y-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group ${!sidebarOpen && "justify-center"}`}
            title={!sidebarOpen ? "Settings" : ""}
          >
            <div className="group-hover:text-primary">
              <Settings className="h-5 w-5" />
            </div>
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
          </Link>

          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group ${!sidebarOpen && "justify-center"}`}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="group-hover:text-primary">
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
