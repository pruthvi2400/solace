import React, { useState, useRef, useEffect } from "react";
import { UserState, ChatMessage } from "../types";
import { Send, Heart, AlertTriangle, ShieldCheck, HelpCircle, RefreshCw, Sparkles, AlertOctagon } from "lucide-react";

interface AIChatProps {
  state: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
}

export default function AIChatView({ state, onUpdateState }: AIChatProps) {
  const { chatHistory, onboarding } = state;
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Emergency Mode states
  const [countdown, setCountdown] = useState(1800); // 30 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [emergencyDraft, setEmergencyDraft] = useState("");
  const [emergencyChatText, setEmergencyChatText] = useState("");
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyReplies, setEmergencyReplies] = useState<string[]>([]);
  
  // Breathing states inside emergency mode
  const [breathState, setBreathState] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathTimer, setBreathTimer] = useState(4);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading, emergencyReplies]);

  // Emergency Timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (emergencyMode && timerRunning && countdown > 0) {
      timerId = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [emergencyMode, timerRunning, countdown]);

  // Breathing guide animation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathState !== "idle") {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            // cycle to next breath stage
            if (breathState === "inhale") {
              setBreathState("hold");
              return 4; // hold for 4s
            } else if (breathState === "hold") {
              setBreathState("exhale");
              return 4; // exhale for 4s
            } else {
              setBreathState("inhale");
              return 4; // inhale for 4s
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathState]);

  const startBreathing = () => {
    setBreathState("inhale");
    setBreathTimer(4);
  };

  const stopBreathing = () => {
    setBreathState("idle");
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: inputText,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [...chatHistory, userMsg];
    
    // Optimistically update frontend history
    onUpdateState({
      chatHistory: updatedHistory,
    });

    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: updatedHistory.slice(-10), // send last 10 messages for context
        }),
      });

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: "model-" + Date.now(),
        role: "model",
        text: data.text,
        createdAt: new Date().toISOString(),
      };

      onUpdateState({
        chatHistory: [...updatedHistory, modelMsg],
      });

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySend = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = emergencyChatText.trim();
    if (!messageToSend || emergencyLoading) return;

    setEmergencyReplies((prev) => [...prev, `You: ${messageToSend}`]);
    setEmergencyChatText("");
    setEmergencyLoading(true);

    try {
      const response = await fetch("/api/emergency/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      setEmergencyReplies((prev) => [...prev, `Solace: ${data.text}`]);
    } catch (error) {
      console.error("Emergency chat failed:", error);
      setEmergencyReplies((prev) => [...prev, "Solace: Please take a deep breath. Focus on your heartbeat. You are strong enough to wait."]);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const enterEmergencyMode = () => {
    setEmergencyMode(true);
    setCountdown(1800); // Reset to 30 mins
    setTimerRunning(true);
    setEmergencyDraft("");
    setEmergencyReplies([
      "Solace: You did the right thing by opening this screen. Before you type anything to them, let's take a slow breath. Write down exactly what you wanted to say to them in the vault below first."
    ]);
    startBreathing();
  };

  const exitEmergencyMode = () => {
    setEmergencyMode(false);
    stopBreathing();
  };

  const saveDraftToJournal = () => {
    if (!emergencyDraft.trim()) return;

    const newJournal = {
      id: "emergency-draft-" + Date.now(),
      date: new Date().toLocaleDateString(),
      title: "Vented Heart (Locked unsent)",
      content: emergencyDraft,
    };

    onUpdateState({
      journals: [newJournal, ...state.journals],
    });

    setEmergencyDraft("");
    alert("Saved securely to your journal vault. Let it rest there.");
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Tab Header Banner */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-4 md:p-6 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-sage-900">AI Healing Companion</h2>
            <p className="text-xs text-sage-600/80">Empathetic, zero-judgment listening companion</p>
          </div>
        </div>

        {!emergencyMode && (
          <button
            onClick={enterEmergencyMode}
            className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>I'm about to text them</span>
          </button>
        )}
      </div>

      {emergencyMode ? (
        /* Emergency Support Mode (Feature 6) */
        <div className="bg-rose-50/50 rounded-3xl border border-rose-100 p-6 md:p-8 space-y-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-rose-200/50 pb-6">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-rose-900">Emergency Support Buffer</h3>
                <p className="text-xs text-rose-700">Creating a gentle pause between emotion and action</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="bg-white px-5 py-3 rounded-2xl border border-rose-200 shadow-sm flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-rose-700">30-Min Pause Timer</span>
              <span className="font-mono text-2xl font-bold text-rose-900 animate-pulse">{formatTime(countdown)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Side: Guiding breathing exercise & draft box */}
            <div className="md:col-span-6 space-y-6">
              
              {/* Guiding Breathing Bubble */}
              <div className="bg-white p-6 rounded-3xl border border-rose-100 flex flex-col items-center justify-center space-y-4 shadow-sm text-center min-h-[180px]">
                {breathState !== "idle" ? (
                  <>
                    <div
                      className={`w-20 h-20 rounded-full bg-sage-200 border-4 border-sage-300 flex items-center justify-center transition-all duration-1000 ${
                        breathState === "inhale" ? "scale-125 bg-sage-300" : ""
                      } ${breathState === "exhale" ? "scale-90 bg-sage-100" : ""}`}
                    >
                      <span className="font-mono text-sm font-semibold text-sage-800 uppercase tracking-wide">
                        {breathState}
                      </span>
                    </div>
                    <p className="text-xs text-sage-700">
                      {breathState === "inhale" && "Breathe in deeply, filling your lungs..."}
                      {breathState === "hold" && "Gently hold your breath, feeling still..."}
                      {breathState === "exhale" && "Exhale slowly, releasing the urge..."}
                      <span className="block font-mono text-[10px] text-sage-500 mt-1">Seconds left: {breathTimer}</span>
                    </p>
                  </>
                ) : (
                  <button
                    onClick={startBreathing}
                    className="py-2 px-4 bg-sage-100 text-sage-800 text-xs font-semibold rounded-full hover:bg-sage-200 transition-all cursor-pointer"
                  >
                    Start Grounding Breathing Loop
                  </button>
                )}
              </div>

              {/* Private draft area */}
              <div className="bg-white p-5 rounded-3xl border border-rose-100 space-y-4 shadow-sm">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-rose-950">Venting Draft Vault</h4>
                  <p className="text-[10px] text-rose-700">Write down exactly what you want to send them. Let it out here instead of sending it.</p>
                </div>
                <textarea
                  rows={4}
                  value={emergencyDraft}
                  onChange={(e) => setEmergencyDraft(e.target.value)}
                  placeholder="Type the message you wanted to send... pour your anger, sorrow, or longing here."
                  className="w-full p-4 text-xs bg-rose-50/20 rounded-xl border border-rose-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sage-900 outline-none resize-none placeholder-sage-500/30"
                />
                <button
                  onClick={saveDraftToJournal}
                  disabled={!emergencyDraft.trim()}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Safely Lock Draft to Private Journal
                </button>
              </div>
            </div>

            {/* Right Side: Quick emergency chat buffer */}
            <div className="md:col-span-6 flex flex-col h-[400px] bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
              <div className="bg-rose-50 p-3 border-b border-rose-100 text-center">
                <span className="text-xs font-serif font-semibold text-rose-900">Empathy Buffer Chat</span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {emergencyReplies.map((reply, idx) => {
                  const isUser = reply.startsWith("You:");
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl max-w-[85%] ${
                        isUser
                          ? "bg-rose-100 text-rose-900 ml-auto"
                          : "bg-beige-50 text-sage-900 mr-auto"
                      }`}
                    >
                      {reply.replace(/^(You:|Solace:)\s*/, "")}
                    </div>
                  );
                })}
                {emergencyLoading && (
                  <div className="text-rose-400 animate-pulse text-[10px] italic">Solace is holding space for you...</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleEmergencySend} className="p-3 border-t border-rose-100 flex gap-2">
                <input
                  type="text"
                  value={emergencyChatText}
                  onChange={(e) => setEmergencyChatText(e.target.value)}
                  placeholder="How does your heart feel now? Talk to me..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50/20 text-xs text-sage-900 focus:outline-none focus:ring-1 focus:ring-rose-400 placeholder-sage-500/30"
                />
                <button
                  type="submit"
                  disabled={!emergencyChatText.trim() || emergencyLoading}
                  className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:bg-rose-200 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex justify-center border-t border-rose-200/50 pt-4">
            <button
              onClick={exitEmergencyMode}
              className="py-2 px-6 bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              The urge has passed, go back to main Solace App
            </button>
          </div>
        </div>
      ) : (
        /* Feature 1: AI Healing Companion Chat */
        <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-4 md:p-6 shadow-sm flex flex-col h-[600px] overflow-hidden relative">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
            {chatHistory.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-xs text-sm leading-relaxed ${
                      isUser
                        ? "bg-sage-500 text-white rounded-tr-none"
                        : "bg-white border border-beige-200 text-sage-900 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                    <span
                      className={`block text-[9px] mt-1.5 text-right ${
                        isUser ? "text-white/70" : "text-sage-500/70"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-beige-200 p-4 rounded-2xl rounded-tl-none text-sage-500 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce delay-150"></span>
                  <span className="italic ml-1">Solace is holding space...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick guidance prompts */}
          <div className="px-4 py-2 flex flex-wrap gap-1.5 justify-center border-t border-beige-200/50 bg-beige-50/30">
            <button
              onClick={() => setInputText("I miss them deeply today.")}
              className="text-[10px] px-2.5 py-1.5 bg-white border border-beige-200 rounded-full text-sage-700 hover:border-sage-400"
            >
              "I miss them..."
            </button>
            <button
              onClick={() => setInputText("I feel like I made a mistake.")}
              className="text-[10px] px-2.5 py-1.5 bg-white border border-beige-200 rounded-full text-sage-700 hover:border-sage-400"
            >
              "I feel guilty..."
            </button>
            <button
              onClick={() => setInputText("I feel lonely and isolated.")}
              className="text-[10px] px-2.5 py-1.5 bg-white border border-beige-200 rounded-full text-sage-700 hover:border-sage-400"
            >
              "I feel lonely..."
            </button>
            <button
              onClick={() => setInputText("Can you remind me why I need to heal?")}
              className="text-[10px] px-2.5 py-1.5 bg-white border border-beige-200 rounded-full text-sage-700 hover:border-sage-400"
            >
              "Why heal?"
            </button>
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSend} className="p-4 border-t border-beige-200 flex gap-3 bg-white">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What is weighing on your heart right now? I'm here..."
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm bg-beige-50/40 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 text-sage-900"
              maxLength={400}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 bg-sage-500 hover:bg-sage-600 disabled:bg-sage-300 text-white rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
