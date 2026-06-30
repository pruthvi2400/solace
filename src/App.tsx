// @ts-ignore // react-router-dom may not have type declarations installed
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { UserState } from "./types";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import AIChatView from "./components/AIChatView";
import ReflectionsView from "./components/ReflectionsView";
import SelfCareView from "./components/SelfCareView";
import GrowthHubView from "./components/GrowthHubView";
import SettingsView from "./components/SettingsView";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { Heart, Home, MessageSquare, BookOpen, Compass, Trophy, Settings, Lock, Unlock, HelpCircle, LogOut } from "lucide-react";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const [state, setState] = useState<UserState | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  
  // Passcode lock simulator states
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  const navigate = useNavigate();

  // Fetch initial state on mount/auth state change
  useEffect(() => {
    if (!user) {
      setLoadingState(false);
      return;
    }
    
    setLoadingState(true);
    const token = localStorage.getItem("token");
    fetch("/api/state", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
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
  }, [user]);

  // Update unified state on backend and frontend
  const handleUpdateState = (updatedPartial: Partial<UserState>) => {
    if (!state) return;

    const merged = { ...state, ...updatedPartial };
    setState(merged);

    const token = localStorage.getItem("token");
    fetch("/api/state", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
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
      routines: [],
      moods: [],
      journals: [],
      memories: [],
      goals: [],
      encouragement: {
        affirmation: "",
        quote: "",
        challenge: "",
        challengeCompleted: false,
      },
      privacy: { passcodeEnabled: false, passcode: "", aiMemoryEnabled: true, dataSharingConsent: true },
      chatHistory: [
        {
          id: "welcome-" + Date.now(),
          role: "model",
          text: "Hello, I\"m Solace. I\"m here to listen, support, and stand by you. You don\"t have to carry this weight alone. How are you holding up right now?",
          createdAt: new Date().toISOString()
        }
      ]
    };

    setState(freshState);
    setIsAppLocked(false);

    const token = localStorage.getItem("token");
    fetch("/api/state", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
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

  const handleOnboardingComplete = async (answers: any) => {
    await handleUpdateState({
        onboarding: answers
    });

    navigate("/", { replace: true });
  };

  if (authLoading || (user && loadingState)) {
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

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/signin"
        element={!user ? <LoginPage onTogglePage={() => navigate("/signup")} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignupPage onTogglePage={() => navigate("/signin")} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/onboarding"
        element={user && state ? <Onboarding onComplete={handleOnboardingComplete} /> : <Navigate to="/signin" replace />}
      />

      {/* Protected Routes */}
      <Route element={<AppLayout user={user} state={state} onUpdateState={handleUpdateState} onResetApp={handleResetApp} isAppLocked={isAppLocked} setIsAppLocked={setIsAppLocked} handleUnlock={handleUnlock} passcodeAttempt={passcodeAttempt} setPasscodeAttempt={setPasscodeAttempt} passcodeError={passcodeError} setPasscodeError={setPasscodeError} logout={logout} />}>
        <Route
          path="/"
          element={
            user && state && !state.onboarding.onboarded ? (
              <Navigate to="/onboarding" replace />
            ) : user && state && state.onboarding.onboarded ? (
              <Dashboard state={state} onUpdateState={handleUpdateState} onNavigate={() => {}} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={user && state ? <AIChatView state={state} onUpdateState={handleUpdateState} /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/reflections"
          element={user && state ? <ReflectionsView state={state} onUpdateState={handleUpdateState} /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/selfcare"
          element={user && state ? <SelfCareView state={state} onUpdateState={handleUpdateState} /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/growth"
          element={user && state ? <GrowthHubView state={state} onUpdateState={handleUpdateState} /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/settings"
          element={user && state ? <SettingsView state={state} onUpdateState={handleUpdateState} onResetApp={handleResetApp} /> : <Navigate to="/signin" replace />}
        />
      </Route>
    </Routes>
  );
}

interface AppLayoutProps {
  user: any;
  state: UserState | null;
  onUpdateState: (updatedPartial: Partial<UserState>) => void;
  onResetApp: () => void;
  isAppLocked: boolean;
  setIsAppLocked: React.Dispatch<React.SetStateAction<boolean>>;
  handleUnlock: (e: React.FormEvent) => void;
  passcodeAttempt: string;
  setPasscodeAttempt: React.Dispatch<React.SetStateAction<string>>;
  passcodeError: boolean;
  setPasscodeError: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => Promise<void>;
}

function AppLayout({ user, state, onUpdateState, onResetApp, isAppLocked, setIsAppLocked, handleUnlock, passcodeAttempt, setPasscodeAttempt, passcodeError, setPasscodeError, logout }: AppLayoutProps) {
  if (!state) return null; // State not loaded yet

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

  const navigate = useNavigate();
  const location = window.location;
  const isDashboardActive = location.pathname === "/" || location.hash === "#/" || location.pathname === "/solace" || location.pathname === "";

  return (
    <div className="min-h-screen bg-beige-100 flex flex-col md:flex-row">
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
              onClick={() => navigate("/")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                isDashboardActive
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => navigate("/chat")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                location.pathname === "/chat"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Companion</span>
            </button>

            <button
              onClick={() => navigate("/reflections")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                location.pathname === "/reflections"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Reflections</span>
            </button>

            <button
              onClick={() => navigate("/selfcare")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                location.pathname === "/selfcare"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Guided Care</span>
            </button>

            <button
              onClick={() => navigate("/growth")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                location.pathname === "/growth"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Growth Hub</span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                location.pathname === "/settings"
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-sage-800 hover:bg-beige-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Privacy settings</span>
            </button>

            <button
              onClick={() => logout()}
              className="w-full px-4 py-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 text-rose-700 hover:bg-rose-50 transition-all cursor-pointer mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Lock Sandbox Trigger */}
        <div className="p-6 border-t border-beige-200/50 hidden md:block">
          {state?.privacy?.passcodeEnabled && (
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
        <Outlet /> {/* Render nested routes here */}
      </main>
    </div>
  );
}

