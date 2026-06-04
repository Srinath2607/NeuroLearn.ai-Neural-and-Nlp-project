"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUIStore } from "@/store/ui-store";
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Menu,
  User,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toggleSidebar } = useUIStore();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUserProfile(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search concepts, chats, notes..." 
            className="w-64 lg:w-96 pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-medium text-muted-foreground font-mono">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-card" />
        </button>

        <div className="h-8 w-px bg-border mx-1" />

        <div className="relative">
          <button 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-full border border-transparent hover:border-border"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
              {userProfile?.name?.charAt(0) || "U"}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{userProfile?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{userProfile?.email || "user@example.com"}</p>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
