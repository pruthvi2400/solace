import React, { useState, useEffect } from "react";
import { UserState } from "./types";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import AIChatView from "./components/AIChatView";
import ReflectionsView from "./components/ReflectionsView";
import SelfCareView from "./components/SelfCareView";
import GrowthHubView from "./components/GrowthHubView";
import SettingsView from "./components/SettingsView";
import { Heart, Home, MessageSquare, BookOpen, Compass, Trophy, Settings, Lock, Unlock, HelpCircle } from "lucide-react";

export default function App() {
  const [state, setState] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [loadingState, setLoadingState] = useState(true);
  
  // Passcode lock simulator states
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  // Fetch initial state on mount
  useEffect(() => {
    fetch("/api/state")
      .then((res) => res.json())
      .then((data: UserState) => {
        setState(data);
        if (data.privacy?.passcodeEnabled) {
          setIsAppLocked(true);
        }
        setLoadingState(false);
      })
      .catch((err) => {
        console.error("Failed to load state from backend:", err);
        setLoadingState(false);
      });
  }, []);

  // Update unified state on backend and frontend
  const handleUpdateState = (updatedPartial: Partial<UserState>) => {
    if (!state) return;

    const merged = { ...state, ...updatedPartial };
    setState(merged);

    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPartial),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          // Sync backend confirmed state
          setState(resData.state);
        }
      })
      .catch((err) => {
        console.error("Failed to sync state with backend:", err);
      });
  };

  // Reset/Purge App State (Factory Reset)
  const handleResetApp = () => {
    const freshState: UserState = {
      onboarding: { name: "", reasons: [], feeling: "lonely", goals: [], onboarded: false },
      noContact: { startDate: null, relapsesCount: 0, lastContactDate: null },
      routines: [
        { id: "1", text: "Drink water regularly", completed: false, category: "body" },
        { id: "2", text: "Eat three nourishing meals", completed: false, category: "body" },
        { id: "3", text: "Brush teeth and shower", completed: false, category: "body" },
        { id: "4", text: "Step outside into nature for 10 min", completed: false, category: "soul" },
        { id: "5", text: "Avoid checking their social media", completed: false, category: "mind" },
        { id: "6", text: "Journal my raw feelings", completed: false, category: "mind" },
        { id: "7", text: "Practice 5 minutes of deep breathing", completed: false, category: "soul" },
        { id: "8", text: "Do one small thing that makes me smile", completed: false, category: "soul" }
      ],
      moods: [],
      journals: [],
      memories: [],
      goals: [
        { id: "g1", title: "Read 10 pages of a comforting book", category: "mind", progress: 0 },
        { id: "g2", title: "Move my body (stretch, walk, or gym)", category: "body", progress: 0 },
        { id: "g3", title: "Spend 20 mins learning a skill or language", category: "growth", progress: 0 },
        { id: "g4", title: "Tidy up my room/desk space", category: "environment", progress: 0 }
      ],
      encouragement: {
        affirmation: "You are allowed to feel everything you're feeling right now. Grief is not a sign of weakness, but a testament to how deeply you loved.",
        quote: "Healing is not a linear climb, but a spiral path. Do not judge your progress by today's heavy weather.",
        challenge: "Drink one warm cup of herbal tea or water, hold the mug in both hands, and take 5 slow, deep breaths.",
        challengeCompleted: false,
      },
      privacy: { passcodeEnabled: false, passcode: "", aiMemoryEnabled: true, dataSharingConsent: true },
      chatHistory: [
        {
          id: "welcome-" + Date.now(),
          role: "model",
          text: "Hello, I'm Solace. I'm here to listen, support, and stand by you. You don't have to carry this weight alone. How are you holding up right now?",
          createdAt: new Date().toISOString()
        }
      ]
    };

    setState(freshState);
    setIsAppLocked(false);
    setActiveTab("dashboard");

    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(freshState),
    }).catch((err) => console.error("Failed to factory reset state:", err));
  };

  // Unlock Passcode Simulator
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;

    if (passcodeAttempt === state.privacy.passcode) {
      setIsAppLocked(false);
      setPasscodeAttempt("");
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscodeAttempt("");
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  if (loadingState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-100">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-sage-100 border border-sage-200 text-sage-600 rounded-full flex items-center justify-center animate-pulse mx-auto">
            <Heart className="w-6 h-6 animate-pulse text-sage-500" />
          </div>
          <p className="font-serif text-sage-800 text-sm italic">Loading your quiet companion...</p>
        </div>
      </div>
    );
  }

  if (!state) return null;

  // Onboarding Stage
  if (!state.onboarding.onboarded) {
    return (
      <Onboarding
        onComplete={(answers) => {
          handleUpdateState({ onboarding: answers });
        }}
      />
    );
  }

  // Passcode Lock Gate
  if (isAppLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-100 px-4">
        <form onSubmit={handleUnlock} className="bg-cream-50 rounded-3xl border border-beige-200 p-8 max-w-sm w-full shadow-lg space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
            <Lock className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-sage-900">Healing Vault Locked</h3>
            <p className="text-xs text-sage-600">Enter your passcode to open your private reflections</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={passcodeAttempt}
              onChange={(e) => setPasscodeAttempt(e.target.value)}
              placeholder="••••"
              className={`w-full text-center tracking-widest text-lg font-mono py-3 rounded-xl border focus:outline-none bg-white ${
                passcodeError ? "border-rose-500 text-rose-600 animate-shake" : "border-beige-300 text-sage-900 focus:ring-1 focus:ring-sage-500"
              }`}
              maxLength={10}
              required
              autoFocus
            />
            {passcodeError && (
              <p className="text-[10px] text-rose-600 font-semibold">Incorrect passcode. Please try again.</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Unlock Vault
            </button>
          </div>
          
          <div className="pt-2 border-t border-beige-200">
            <p className="text-[9px] text-sage-600 italic">"Your heart is a sanctuary. We keep it locked."</p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100 flex flex-col md:flex-row">
      
      {/* Top Banner / Side Rail Layout */}
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-cream-50 border-b md:border-b-0 md:border-r border-beige-200/60 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sage-500 text-white rounded-xl flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-sage-950 tracking-tight leading-none">Solace</h1>
              <span className="text-[9px] font-mono uppercase tracking-wider text-sage-500 font-semibold mt-1 block">Healing Companion</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Companion</span>
            </button>

            <button
              onClick={() => setActiveTab("reflections")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "reflections"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Reflections</span>
            </button>

            <button
              onClick={() => setActiveTab("selfcare")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "selfcare"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Guided Care</span>
            </button>

            <button
              onClick={() => setActiveTab("growth")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "growth"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Growth Hub</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Privacy settings</span>
            </button>
          </nav>
        </div>

        {/* Lock Sandbox Trigger */}
        <div className="p-6 border-t border-beige-200/50 hidden md:block">
          {state.privacy.passcodeEnabled && (
            <button
              onClick={() => setIsAppLocked(true)}
              className="w-full py-2.5 bg-white hover:bg-beige-50 border border-beige-300 text-sage-800 text-[10px] font-mono tracking-wide uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Vault Now</span>
            </button>
          )}
          <span className="block text-[9px] text-sage-500 text-center mt-3 font-mono">
            Solace Web Sandbox v1.2
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <Dashboard
            state={state}
            onUpdateState={handleUpdateState}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "chat" && (
          <AIChatView
            state={state}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === "reflections" && (
          <ReflectionsView
            state={state}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === "selfcare" && (
          <SelfCareView
            state={state}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === "growth" && (
          <GrowthHubView
            state={state}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            state={state}
            onUpdateState={handleUpdateState}
            onResetApp={handleResetApp}
          />
        )}
      </main>
    </div>
  );
}
