import React, { useState, useEffect } from "react";
import { UserState } from "../types";
import { Play, Pause, RefreshCw, Volume2, Sparkles, Smile, Compass, Feather, BookOpen, Clock } from "lucide-react";

interface SelfCareProps {
  state: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
}

export default function SelfCareView({ state, onUpdateState }: SelfCareProps) {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  
  // Interactive Breathing states
  const [breathState, setBreathState] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathTimer, setBreathTimer] = useState(4);
  const [cyclesCount, setCyclesCount] = useState(0);

  // Meditation States
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [meditationDuration, setMeditationDuration] = useState(300); // 5 mins in seconds

  // Grounding Exercise (5-4-3-2-1) States
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[]>(["", "", "", "", ""]);
  
  // Gratitude logs
  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  const meditations = [
    { id: "m1", title: "Self-Compassion in Heartbreak", desc: "A gentle session to stop blaming yourself and embrace your raw feelings with kindness.", duration: 420 },
    { id: "m2", title: "Grounding in the Present Moment", desc: "A somatic technique to anchor yourself when anxiety or panic spikes.", duration: 300 },
    { id: "m3", title: "Releasing the Need for Answers", desc: "Letting go of the endless 'why' and finding comfort in the silence.", duration: 600 },
    { id: "m4", title: "Quiet Mind Before Sleep", desc: "Settle your racing thoughts and prepare your nervous system for rest.", duration: 900 }
  ];

  // Breathing loop timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathState !== "idle") {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathState === "inhale") {
              setBreathState("hold");
              return 4;
            } else if (breathState === "hold") {
              setBreathState("exhale");
              return 4;
            } else {
              setBreathState("inhale");
              setCyclesCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathState]);

  // Meditation player timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && meditationTime < meditationDuration) {
      interval = setInterval(() => {
        setMeditationTime((prev) => prev + 1);
      }, 1000);
    } else if (meditationTime >= meditationDuration) {
      setIsPlaying(false);
      setMeditationTime(0);
      alert("Session completed beautifully. Thank you for this kind gift to yourself.");
    }
    return () => clearInterval(interval);
  }, [isPlaying, meditationTime]);

  const startBreathing = () => {
    setBreathState("inhale");
    setBreathTimer(4);
    setCyclesCount(0);
  };

  const stopBreathing = () => {
    setBreathState("idle");
    setBreathTimer(4);
  };

  const startMeditation = (id: string, duration: number) => {
    setActiveSession(id);
    setMeditationDuration(duration);
    setMeditationTime(0);
    setIsPlaying(true);
  };

  const togglePlayMeditation = () => {
    setIsPlaying(!isPlaying);
  };

  const formatMeditationTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!g1.trim() && !g2.trim() && !g3.trim()) return;

    // Append to current journal entry to persist securely
    const gratitudeText = `Gratitude Practice:\n1. ${g1 || "none"}\n2. ${g2 || "none"}\n3. ${g3 || "none"}`;
    const newJournal = {
      id: "gratitude-" + Date.now(),
      date: new Date().toLocaleDateString(),
      title: "Three Seeds of Gratitude",
      content: gratitudeText
    };

    onUpdateState({
      journals: [newJournal, ...state.journals],
    });

    setGratitudeSaved(true);
    setTimeout(() => {
      setG1("");
      setG2("");
      setG3("");
      setGratitudeSaved(false);
    }, 3500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Tab Welcome Header */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-sage-900">Guided Self-Care</h2>
            <p className="text-xs text-sage-600/80">Take a somatic breath, play a meditation, or focus on gratitude</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left column: Breathing and Grounding */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Feature 10 (Guided session: breathing) */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 md:p-8 space-y-6 shadow-sm text-center">
            <div className="border-b border-beige-200 pb-3 text-left">
              <h3 className="font-serif text-base font-semibold text-sage-900">Somatic Breathing Companion</h3>
              <p className="text-xs text-sage-600">Box breathing to settle an overstimulated nervous system</p>
            </div>

            <div className="py-8 flex flex-col items-center justify-center space-y-6 min-h-[260px]">
              {breathState !== "idle" ? (
                <>
                  {/* Expanding Bubble with Tailwind transition classes */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 border-4 ${
                        breathState === "inhale"
                          ? "scale-130 bg-sage-200/80 border-sage-400"
                          : breathState === "hold"
                          ? "scale-130 bg-sage-300 border-sage-500 animate-pulse"
                          : "scale-100 bg-sage-100/50 border-sage-300"
                      }`}
                    >
                      <span className="font-mono text-sm font-bold text-sage-800 uppercase tracking-widest">
                        {breathState}
                      </span>
                    </div>

                    {/* Outer rings */}
                    <div className="absolute inset-0 rounded-full bg-sage-300/10 animate-ping"></div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-sage-900">
                      {breathState === "inhale" && "Inhale deeply... feel the clean, cold air filling you up."}
                      {breathState === "hold" && "Hold... feel the stillness of this perfect pause."}
                      {breathState === "exhale" && "Exhale slowly... releasing all the heat and sorrow."}
                    </p>
                    <p className="text-xs font-mono text-sage-500">
                      Seconds left: {breathTimer} | Cycles completed: {cyclesCount}
                    </p>
                  </div>

                  <button
                    onClick={stopBreathing}
                    className="py-2 px-4 border border-beige-300 hover:bg-beige-50 text-sage-700 text-xs font-medium rounded-xl transition-all cursor-pointer"
                  >
                    Finish Session
                  </button>
                </>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <p className="text-xs text-sage-700/85">
                    Whenever you feel a sudden wave of longing, anger, or urge to check their profile, sit comfortably and tap below to start.
                  </p>
                  <button
                    onClick={startBreathing}
                    className="py-3.5 px-6 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Begin Guided Somatic Breathing Loop
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Somatic 5-4-3-2-1 Grounding Exercise */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-4 shadow-sm">
            <div className="border-b border-beige-200 pb-3">
              <h3 className="font-serif text-base font-semibold text-sage-900">5-4-3-2-1 Grounding Method</h3>
              <p className="text-xs text-sage-600">Reconnect with your physical surroundings to soothe panic</p>
            </div>

            {groundingStep === 0 ? (
              <div className="space-y-4 py-3">
                <p className="text-xs text-sage-700/80 leading-relaxed">
                  When heartbreak triggers cognitive loops, your brain gets stuck in the past. This visual/sensory checklist redirects your immediate focus to the physical room around you.
                </p>
                <button
                  onClick={() => setGroundingStep(1)}
                  className="py-2.5 px-4 bg-white border border-beige-300 hover:bg-beige-50 text-sage-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Start Grounding Steps
                </button>
              </div>
            ) : groundingStep <= 5 ? (
              <div className="space-y-4">
                <div className="bg-white/80 p-4 rounded-2xl border border-beige-200 space-y-2">
                  <span className="text-xs font-mono font-bold text-sage-600 uppercase tracking-widest">
                    Step {groundingStep} of 5
                  </span>
                  <h4 className="font-serif font-bold text-sm text-sage-900">
                    {groundingStep === 1 && "👁️ Notice 5 things you can SEE around you."}
                    {groundingStep === 2 && "🤝 Notice 4 things you can TOUCH (e.g. table, fabric)."}
                    {groundingStep === 3 && "👂 Notice 3 things you can HEAR (e.g. hum of fan, birds)."}
                    {groundingStep === 4 && "👃 Notice 2 things you can SMELL (e.g. coffee, paper)."}
                    {groundingStep === 5 && "👅 Notice 1 thing you can TASTE (e.g. toothpaste, water)."}
                  </h4>
                  <input
                    type="text"
                    value={groundingInputs[groundingStep - 1]}
                    onChange={(e) => {
                      const updated = [...groundingInputs];
                      updated[groundingStep - 1] = e.target.value;
                      setGroundingInputs(updated);
                    }}
                    placeholder="Type your observation here..."
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-beige-300 focus:outline-none focus:ring-1 focus:ring-sage-500"
                    onKeyDown={(e) => e.key === 'Enter' && groundingInputs[groundingStep - 1].trim() && setGroundingStep(groundingStep + 1)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setGroundingStep(0)}
                    className="py-1.5 px-3 border border-beige-200 rounded-lg text-xs hover:bg-beige-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setGroundingStep(groundingStep + 1)}
                    disabled={!groundingInputs[groundingStep - 1].trim()}
                    className="py-1.5 px-4 bg-sage-500 hover:bg-sage-600 text-white rounded-lg text-xs disabled:bg-sage-300 font-semibold cursor-pointer"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <span className="text-2xl">🌱</span>
                <p className="text-xs font-semibold text-sage-900">Somatic Grounding Completed.</p>
                <p className="text-[11px] text-sage-600">Your breathing and mind are back in the room. You are safe. You are in the present.</p>
                <button
                  onClick={() => {
                    setGroundingStep(0);
                    setGroundingInputs(["", "", "", "", ""]);
                  }}
                  className="py-2 px-4 border border-beige-300 hover:bg-beige-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Grounding
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Meditations and Gratitude */}
        <div className="md:col-span-5 space-y-8">
          
          {/* Guided Meditation list / player */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-6 shadow-sm">
            <div className="border-b border-beige-200 pb-3">
              <h3 className="font-serif text-base font-semibold text-sage-900">Meditations & Visualizations</h3>
              <p className="text-xs text-sage-600">Calm audio simulations to rest your mind</p>
            </div>

            {activeSession ? (
              /* Simulated Player */
              <div className="bg-white p-5 rounded-2xl border border-beige-200 space-y-4 shadow-2xs text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-sage-500 uppercase tracking-widest">Now Playing</span>
                  <h4 className="font-serif text-sm font-semibold text-sage-900">
                    {meditations.find(m => m.id === activeSession)?.title}
                  </h4>
                </div>

                {/* Animated visualizer block */}
                <div className="h-12 flex items-center justify-center gap-1.5 py-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-sage-500 rounded-full transition-all duration-300 ${
                        isPlaying ? "animate-pulse" : "h-2"
                      }`}
                      style={{
                        height: isPlaying ? `${Math.floor(Math.random() * 24) + 8}px` : "6px",
                        animationDelay: `${i * 150}ms`
                      }}
                    ></div>
                  ))}
                </div>

                <div className="space-y-2">
                  {/* Progress bar */}
                  <div className="w-full bg-beige-200 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-sage-500 h-full transition-all duration-1000"
                      style={{ width: `${(meditationTime / meditationDuration) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-sage-500">
                    <span>{formatMeditationTime(meditationTime)}</span>
                    <span>{formatMeditationTime(meditationDuration)}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-1">
                  <button
                    onClick={togglePlayMeditation}
                    className="p-3 bg-sage-500 text-white rounded-full hover:bg-sage-600 shadow-sm cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setActiveSession(null)}
                    className="py-2.5 px-4 border border-beige-200 rounded-xl text-xs hover:bg-beige-50"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            ) : (
              /* Session List */
              <div className="space-y-3">
                {meditations.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => startMeditation(med.id, med.duration)}
                    className="w-full p-3 bg-white hover:bg-beige-50/30 border border-beige-200 rounded-2xl text-left flex items-start gap-3 transition-all cursor-pointer"
                  >
                    <div className="p-2 bg-sage-50 text-sage-600 rounded-xl">
                      <Play className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-sage-900">{med.title}</h4>
                        <span className="text-[10px] font-mono text-sage-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {med.duration / 60}m
                        </span>
                      </div>
                      <p className="text-[11px] text-sage-600/80 leading-snug">{med.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Three Gratitudes Practice */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-4 shadow-sm">
            <div className="border-b border-beige-200 pb-3">
              <h3 className="font-serif text-base font-semibold text-sage-900">Three Little Flowers</h3>
              <p className="text-xs text-sage-600">Register three tiny things you are grateful for today</p>
            </div>

            {gratitudeSaved ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-2xl">🌸</span>
                <p className="text-xs font-semibold text-sage-900">Your Gratitudes have been logged.</p>
                <p className="text-[11px] text-sage-600">They are saved safely inside your Reflection Journal vault.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveGratitude} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-sage-400 font-serif">1.</span>
                  <input
                    type="text"
                    value={g1}
                    onChange={(e) => setG1(e.target.value)}
                    placeholder="e.g. A warm cup of mint tea..."
                    className="w-full pl-7 pr-3 py-2 text-xs bg-white rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40"
                    maxLength={100}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-sage-400 font-serif">2.</span>
                  <input
                    type="text"
                    value={g2}
                    onChange={(e) => setG2(e.target.value)}
                    placeholder="e.g. Cleansing sound of evening rain..."
                    className="w-full pl-7 pr-3 py-2 text-xs bg-white rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40"
                    maxLength={100}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-sage-400 font-serif">3.</span>
                  <input
                    type="text"
                    value={g3}
                    onChange={(e) => setG3(e.target.value)}
                    placeholder="e.g. Slept without dreaming of them..."
                    className="w-full pl-7 pr-3 py-2 text-xs bg-white rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40"
                    maxLength={100}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!g1.trim() && !g2.trim() && !g3.trim()}
                  className="w-full py-2 bg-sage-500 hover:bg-sage-600 disabled:bg-sage-300 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                >
                  Save Gratitude Seeds
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
