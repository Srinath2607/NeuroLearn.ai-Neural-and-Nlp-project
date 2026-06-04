"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Bell, 
  Palette, 
  Cpu, 
  Save, 
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

type Tab = "profile" | "preferences" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    avatar: ""
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    theme: "dark",
    notifications: true,
    aiModel: "gpt-4o",
    language: "english"
  });

  // Security State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    // Fetch initial user data
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || "",
            bio: data.bio || "",
            avatar: data.avatar || ""
          });
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/user/profile", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Failed to update profile.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/user/preferences", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ preferences })
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Preferences updated successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Failed to update preferences.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/user/password", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to update password.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab, label: string, icon: any }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "security", label: "Security", icon: ShieldCheck }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and personal preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setStatus(null); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-card hover:bg-secondary border border-border"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border border-border rounded-3xl p-8 shadow-sm min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.form
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleUpdateProfile}
                className="space-y-6"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-border overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <button type="button" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      <Camera className="h-6 w-6" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Update your avatar to personalize your experience.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Bio</label>
                    <textarea 
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px] resize-none"
                      placeholder="Tell us about your learning goals..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Changes
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === "preferences" && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Theme Preference</h4>
                        <p className="text-sm text-muted-foreground">Select how NeuroLearn AI looks for you.</p>
                      </div>
                    </div>
                    <select 
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="bg-secondary border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive weekly progress reports and study reminders.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${preferences.notifications ? "bg-primary" : "bg-muted"}`}
                    >
                      <motion.div 
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                        animate={{ x: preferences.notifications ? 24 : 0 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-500">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Default AI Agent</h4>
                        <p className="text-sm text-muted-foreground">Select the preferred LLM for your learning assistant.</p>
                      </div>
                    </div>
                    <select 
                      value={preferences.aiModel}
                      onChange={(e) => setPreferences({ ...preferences, aiModel: e.target.value })}
                      className="bg-secondary border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="gpt-4o">GPT-4o (Premium)</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="llama-3">Llama 3 (Open Source)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <button 
                    onClick={handleUpdatePreferences}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.form
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleUpdatePassword}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Current Password</label>
                  <input 
                    type="password" 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">New Password</label>
                  <input 
                    type="password" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Update Password
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Status Message */}
          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                  status.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span className="text-sm font-medium">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
