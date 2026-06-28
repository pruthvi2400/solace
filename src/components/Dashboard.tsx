import React, { useState, useEffect } from "react";
import { UserState, RoutineItem } from "../types";
import { Clock, CheckCircle2, Heart, Sparkles, BookOpen, Smile, ChevronRight, AlertTriangle, Compass, ShieldAlert, RefreshCw } from "lucide-react";

interface DashboardProps {
  state: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ state, onUpdateState, onNavigate }: DashboardProps) {
  const { onboarding, noContact, routines, moods, journals, encouragement } = state;
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [tempNote, setTempNote] = useState("");
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [showAlmostTextedModal, setShowAlmostTextedModal] = useState(false);
  const [almostTextDraft, setAlmostTextDraft] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  // Growth calculation based on self-care
  const growthPoints = (routines.filter(r => r.completed).length) + (moods.length * 2) + journals.length;
  let stage = { name: "Seed", icon: "🌱", desc: "You have just planted the seed of your recovery. Rest, hydrate, and breathe." };
  if (growthPoints >= 8 && growthPoints < 20) {
    stage = { name: "Growing", icon: "🌿", desc: "You are active in your self-care. Tiny roots are grounding you in your new life." };
  } else if (growthPoints >= 20 && growthPoints < 40) {
    stage = { name: "Blooming", icon: "🌸", desc: "You are rediscovering joy and beauty. Your self-worth is opening up to the light." };
  } else if (growthPoints >= 40) {
    stage = { name: "Thriving", icon: "🌳", desc: "You stand strong, tall, and confident. You are living deeply for yourself now." };
  }

  // Calculate No Contact duration
  useEffect(() => {
    if (!noContact.startDate) return;

    const interval = setInterval(() => {
      const start = new Date(noContact.startDate!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeElapsed({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [noContact.startDate]);

  const handleStartNoContact = () => {
    onUpdateState({
      noContact: {
        ...noContact,
        startDate: new Date().toISOString(),
        lastContactDate: null
      }
    });
  };

  const handleRelapse = () => {
    setShowRelapseModal(true);
  };

  const confirmRelapse = () => {
    onUpdateState({
      noContact: {
        startDate: new Date().toISOString(),
        relapsesCount: noContact.relapsesCount + 1,
        lastContactDate: new Date().toISOString()
      }
    });
    setShowRelapseModal(false);
  };

  const handleAlmostTexted = () => {
    setShowAlmostTextedModal(true);
    setAlmostTextDraft("");
    setDraftSaved(false);
  };

  const saveAlmostTextDraft = () => {
    if (!almostTextDraft.trim()) return;

    // Save as a private journal entry
    const newJournal = {
      id: "nc-draft-" + Date.now(),
      date: new Date().toLocaleDateString(),
      title: "Unsent Message to Ex (Released here)",
      content: almostTextDraft
    };

    onUpdateState({
      journals: [newJournal, ...journals],
    });

    setDraftSaved(true);
    setTimeout(() => {
      setShowAlmostTextedModal(false);
    }, 2000);
  };

  const toggleRoutine = (id: string) => {
    const updatedRoutines = routines.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    onUpdateState({ routines: updatedRoutines });
  };

  const toggleChallenge = () => {
    onUpdateState({
      encouragement: {
        ...encouragement,
        challengeCompleted: !encouragement.challengeCompleted
      }
    });
  };

  const routineProgress = routines.length > 0 
    ? Math.round((routines.filter(r => r.completed).length / routines.length) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Welcome / Header */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sage-100 text-sage-800 text-xs font-mono rounded-full font-medium">Warm Welcome</span>
          </div>
          <h1 className="font-serif text-3xl text-sage-900 tracking-tight">
            How is your heart today, {onboarding.name}?
          </h1>
          <p className="text-sm text-sage-700/80 max-w-xl">
            You are in a safe, peaceful space. Here, healing is allowed to take exactly as long as it needs. There is absolutely no rush.
          </p>
        </div>
        
        {/* Growth representation */}
        <div className="bg-white rounded-2xl border border-beige-200 p-4 flex items-center gap-4 md:w-80 relative z-10 shadow-sm">
          <div className="text-4xl">{stage.icon}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-sage-600 uppercase tracking-wider">Growth Stage</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-sage-50 text-sage-700 rounded border border-sage-100 font-mono font-medium">{growthPoints} XP</span>
            </div>
            <h3 className="font-serif font-semibold text-sage-900 text-lg">{stage.name}</h3>
            <p className="text-[11px] text-sage-600 leading-tight">{stage.desc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column (No Contact & Encouragement) */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Feature 2: No Contact Companion */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-beige-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-sage-900">No Contact Companion</h2>
                  <p className="text-xs text-sage-600/80">Rebuilding your independent strength</p>
                </div>
              </div>
              {noContact.startDate && (
                <span className="text-[10px] px-2.5 py-1 bg-beige-200/50 text-sage-800 rounded-full font-mono">
                  Relapses: {noContact.relapsesCount}
                </span>
              )}
            </div>

            {noContact.startDate ? (
              <div className="space-y-6">
                {/* Timer Display */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-3 rounded-2xl border border-beige-200">
                    <span className="block text-2xl md:text-3xl font-mono font-semibold text-sage-900">{timeElapsed.days}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sage-600">Days</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-beige-200">
                    <span className="block text-2xl md:text-3xl font-mono font-semibold text-sage-900">{timeElapsed.hours}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sage-600">Hours</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-beige-200">
                    <span className="block text-2xl md:text-3xl font-mono font-semibold text-sage-900">{timeElapsed.minutes}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sage-600">Mins</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-beige-200">
                    <span className="block text-2xl md:text-3xl font-mono font-semibold text-sage-900">{timeElapsed.seconds}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sage-600">Secs</span>
                  </div>
                </div>

                {/* Milestone Affirmation */}
                <div className="bg-sage-50/50 p-4 rounded-2xl border border-sage-100 text-center">
                  <p className="text-xs italic text-sage-800 font-serif">
                    {timeElapsed.days === 0 
                      ? "Every hour of silence is an hour of self-respect. You are doing beautiful work."
                      : `You have held space for yourself for ${timeElapsed.days} full days. Your energy is flowing back to you.`
                    }
                  </p>
                </div>

                {/* Action Controls */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleAlmostTexted}
                    className="py-3 px-1 text-center bg-white border border-beige-300 rounded-xl text-xs font-medium text-sage-800 hover:bg-beige-50 transition-all cursor-pointer shadow-sm"
                  >
                    I almost texted
                  </button>
                  <button
                    onClick={handleRelapse}
                    className="py-3 px-1 text-center bg-white border border-beige-300 rounded-xl text-xs font-medium text-sage-800 hover:bg-beige-50 transition-all cursor-pointer shadow-sm"
                  >
                    I contacted them
                  </button>
                  <button
                    onClick={() => onNavigate("chat")}
                    className="py-3 px-1 text-center bg-sage-500 rounded-xl text-xs font-medium text-white hover:bg-sage-600 transition-all cursor-pointer shadow-sm"
                  >
                    Help me stay strong
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-sage-700/80 max-w-sm mx-auto">
                  Taking a clean break is one of the kindest boundaries you can set for your healing heart. Start your timer when you are ready.
                </p>
                <button
                  onClick={handleStartNoContact}
                  className="py-3 px-6 bg-sage-500 hover:bg-sage-600 text-white font-medium text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Start No Contact Timer
                </button>
              </div>
            )}
          </div>

          {/* Feature 9: Daily Encouragement Card */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-beige-200 pb-4">
              <div className="w-10 h-10 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-sage-900">Daily Encouragement</h2>
                <p className="text-xs text-sage-600/80">Affirmation, quote, and small challenge</p>
              </div>
            </div>

            {/* Affirmation block */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sage-600 block">Today's Affirmation</span>
              <p className="text-base text-sage-900 font-medium font-sans border-l-2 border-sage-300 pl-3 italic">
                "{encouragement.affirmation}"
              </p>
            </div>

            {/* Quote block */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sage-600 block">Thoughtful Quote</span>
              <p className="text-sm font-serif text-sage-700">
                "{encouragement.quote}"
              </p>
            </div>

            {/* Challenge block */}
            <div className="bg-white p-4 rounded-2xl border border-beige-200 space-y-3 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-lavender-600 bg-lavender-50 px-2 py-0.5 rounded border border-lavender-100 font-medium">Daily Challenge</span>
                  <p className="text-xs font-semibold text-sage-900">{encouragement.challenge}</p>
                </div>
                <button
                  onClick={toggleChallenge}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    encouragement.challengeCompleted
                      ? "bg-sage-100 border-sage-500 text-sage-600"
                      : "bg-white border-beige-300 text-beige-300 hover:border-sage-400"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-sage-600/75">Completing daily challenge nurtures your recovery stage 🌱</p>
            </div>
          </div>
        </div>

        {/* Right Column (Daily Healing Routine) */}
        <div className="md:col-span-5 space-y-8">
          
          {/* Feature 3: Daily Healing Routine Checklist */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-6 shadow-sm">
            <div className="space-y-1.5 border-b border-beige-200 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-softblue-100 rounded-full flex items-center justify-center text-softblue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-sage-900">Healing Routine</h2>
                    <p className="text-xs text-sage-600/80">Gentle self-care checklist</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-sage-900">{routineProgress}%</span>
              </div>

              {/* Mini progress indicator */}
              <div className="w-full bg-beige-200 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-sage-500 h-full transition-all duration-500" style={{ width: `${routineProgress}%` }}></div>
              </div>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => toggleRoutine(routine.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    routine.completed
                      ? "bg-sage-50/50 border-sage-300 text-sage-600"
                      : "bg-white border-beige-200 hover:bg-beige-50/20 text-sage-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    routine.completed ? "bg-sage-500 border-sage-500 text-white" : "border-beige-300 bg-white"
                  }`}>
                    {routine.completed && <span className="text-[10px]">✓</span>}
                  </div>
                  <span className={`text-xs ${routine.completed ? "line-through opacity-75" : ""}`}>{routine.text}</span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-sage-600/75 leading-relaxed text-center italic">
              "Setbacks are part of recovery. If you only complete one thing today, even if it's just drinking water, that is a massive victory."
            </p>
          </div>

          {/* Quick Buttons Card */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 text-center space-y-4 shadow-sm">
            <h3 className="font-serif text-sm font-semibold text-sage-900">Need Immediate Support?</h3>
            <p className="text-xs text-sage-700/80">
              Experiencing a sudden wave of sadness, panic, or urge to text?
            </p>
            <button
              onClick={() => onNavigate("chat")}
              className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl tracking-wide uppercase transition-all shadow-sm cursor-pointer"
            >
              ⚠️ I'm about to text them
            </button>
            <button
              onClick={() => onNavigate("selfcare")}
              className="w-full py-3 bg-white border border-beige-300 text-sage-800 hover:bg-beige-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              🌿 Open Guided Self-Care Session
            </button>
          </div>
        </div>
      </div>

      {/* Relapse Restart Modal */}
      {showRelapseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-cream-50 max-w-sm w-full rounded-3xl p-6 border border-beige-200 shadow-xl space-y-4">
            <div className="text-center">
              <span className="text-3xl">🌸</span>
              <h3 className="font-serif text-lg font-semibold text-sage-900 mt-2">You are safe here.</h3>
            </div>
            <p className="text-xs text-sage-700/85 leading-relaxed text-center">
              One difficult moment does not erase the days, hours, or minutes of strength you built. Healing is not a straight climb. You did not 'fail'. You are just human, navigating a storm.
            </p>
            <p className="text-xs text-sage-700/85 leading-relaxed text-center font-medium">
              Would you like to restart the timer today to mark a fresh chapter in your healing?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRelapseModal(false)}
                className="w-1/2 py-3 border border-beige-300 rounded-xl text-xs font-medium text-sage-700 hover:bg-beige-50 cursor-pointer"
              >
                No, Keep Timer
              </button>
              <button
                onClick={confirmRelapse}
                className="w-1/2 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-xs font-medium shadow-sm cursor-pointer"
              >
                Yes, Restart Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Almost Texted Draft Modal */}
      {showAlmostTextedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-cream-50 max-w-md w-full rounded-3xl p-6 border border-beige-200 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-beige-200 pb-3">
              <div>
                <h3 className="font-serif text-base font-semibold text-sage-900">Unsent Message Vault</h3>
                <p className="text-[10px] text-sage-600">Pour your words here instead of sending them.</p>
              </div>
              <button
                onClick={() => setShowAlmostTextedModal(false)}
                className="text-sage-500 hover:text-sage-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {draftSaved ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-3xl">🕊️</span>
                <p className="text-sm font-semibold text-sage-900">Your message has been locked in the vault.</p>
                <p className="text-xs text-sage-600">It is safe here. It left your mind, and did not break your progress.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={almostTextDraft}
                  onChange={(e) => setAlmostTextDraft(e.target.value)}
                  placeholder="Type exactly what you wanted to text them here... release the weight."
                  className="w-full p-4 text-xs bg-white rounded-xl border border-beige-300 focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 text-sage-900 placeholder-sage-500/40 resize-none outline-none"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowAlmostTextedModal(false)}
                    className="py-2.5 px-4 border border-beige-300 rounded-xl text-xs font-medium text-sage-700 hover:bg-beige-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAlmostTextDraft}
                    disabled={!almostTextDraft.trim()}
                    className="py-2.5 px-4 bg-sage-500 hover:bg-sage-600 disabled:bg-sage-300 text-white rounded-xl text-xs font-medium shadow-sm cursor-pointer"
                  >
                    Release & Lock in Journal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
