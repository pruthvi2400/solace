import React, { useState } from "react";
import { UserState, MoodEntry, JournalEntry, MemoryItem } from "../types";
import { Heart, BookOpen, Lock, Unlock, Eye, Sparkles, Smile, ShieldCheck, PenSquare, Trash2, HelpCircle } from "lucide-react";

interface ReflectionsProps {
  state: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
}

export default function ReflectionsView({ state, onUpdateState }: ReflectionsProps) {
  const { moods, journals, memories } = state;

  // Mood State
  const [moodValue, setMoodValue] = useState(3);
  const [moodNote, setMoodNote] = useState("");
  const [moodAdded, setMoodAdded] = useState(false);

  // Journal State
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [showAddJournal, setShowAddJournal] = useState(false);

  // Memory Box State
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryContent, setMemoryContent] = useState("");
  const [memoryType, setMemoryType] = useState<'note' | 'photo' | 'song'>('note');
  const [unlockDelayDays, setUnlockDelayDays] = useState(30);
  const [showAddMemory, setShowAddMemory] = useState(false);

  const moodScale = [
    { value: 1, label: "Hurting", emoji: "💔", color: "text-rose-500 bg-rose-50" },
    { value: 2, label: "Heavy", emoji: "🌫️", color: "text-amber-500 bg-amber-50" },
    { value: 3, label: "Fragile", emoji: "🌱", color: "text-blue-500 bg-blue-50" },
    { value: 4, label: "Recovering", emoji: "🌿", color: "text-sage-600 bg-sage-50" },
    { value: 5, label: "Peaceful", emoji: "✨", color: "text-lavender-500 bg-lavender-50" },
  ];

  const handleAddMood = (e: React.FormEvent) => {
    e.preventDefault();
    const newMood: MoodEntry = {
      id: "mood-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      value: moodValue,
      note: moodNote.trim() || "Regular check-in",
    };

    onUpdateState({
      moods: [newMood, ...moods],
    });

    setMoodNote("");
    setMoodAdded(true);
    setTimeout(() => setMoodAdded(false), 3000);
  };

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const newJournal: JournalEntry = {
      id: "journal-" + Date.now(),
      date: new Date().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      title: journalTitle.trim(),
      content: journalContent.trim(),
    };

    onUpdateState({
      journals: [newJournal, ...journals],
    });

    setJournalTitle("");
    setJournalContent("");
    setShowAddJournal(false);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle.trim() || !memoryContent.trim()) return;

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + unlockDelayDays);

    const newMemory: MemoryItem = {
      id: "memory-" + Date.now(),
      title: memoryTitle.trim(),
      content: memoryContent.trim(),
      createdAt: new Date().toISOString(),
      unlockDate: unlockDate.toISOString(),
      type: memoryType,
    };

    onUpdateState({
      memories: [newMemory, ...memories],
    });

    setMemoryTitle("");
    setMemoryContent("");
    setShowAddMemory(false);
  };

  const deleteJournal = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this journal entry? Your journal is encrypted and private.")) {
      onUpdateState({
        journals: journals.filter(j => j.id !== id)
      });
    }
  };

  // Pattern Insights Engine
  const generateInsights = () => {
    if (moods.length < 2) {
      return "Log your mood and activities for a few days so Solace can gently map your emotional patterns.";
    }

    const totalMoodValue = moods.reduce((sum, m) => sum + m.value, 0);
    const avgMood = totalMoodValue / moods.length;

    const natureLogs = moods.filter(m => m.note.toLowerCase().includes("nature") || m.note.toLowerCase().includes("outside") || m.note.toLowerCase().includes("walk"));
    const exerciseLogs = moods.filter(m => m.note.toLowerCase().includes("exercise") || m.note.toLowerCase().includes("workout") || m.note.toLowerCase().includes("run") || m.note.toLowerCase().includes("gym"));
    const sleepLogs = moods.filter(m => m.note.toLowerCase().includes("sleep") || m.note.toLowerCase().includes("rested") || m.note.toLowerCase().includes("bed"));

    let insightsList = [];
    if (avgMood < 3) {
      insightsList.push("You are carrying a heavy load lately. Rest should be your primary medicine right now.");
    } else {
      insightsList.push("You are maintaining solid emotional resilience. Let yourself bask in these quiet victories.");
    }

    if (natureLogs.length > 0) {
      const avgNature = natureLogs.reduce((sum, m) => sum + m.value, 0) / natureLogs.length;
      if (avgNature >= 3.5) {
        insightsList.push("🌱 Pattern detected: Stepping outdoors into nature correlates with a highly elevated emotional well-being.");
      }
    }

    if (exerciseLogs.length > 0) {
      const avgExercise = exerciseLogs.reduce((sum, m) => sum + m.value, 0) / exerciseLogs.length;
      if (avgExercise >= 3.5) {
        insightsList.push("🏃 Pattern detected: Moving your body consistently correlates with a dramatic lift in your spirit and mood.");
      }
    }

    if (sleepLogs.length > 0) {
      const avgSleep = sleepLogs.reduce((sum, m) => sum + m.value, 0) / sleepLogs.length;
      if (avgSleep >= 3.5) {
        insightsList.push("🌌 Pattern detected: Sleep and deep rest are acting as major stabilizers for your heart.");
      }
    }

    return insightsList.map((ins, i) => (
      <div key={i} className="flex items-start gap-2.5 text-xs text-sage-800 leading-relaxed bg-white/60 p-3 rounded-xl border border-beige-200 shadow-2xs">
        <Sparkles className="w-4 h-4 text-sage-500 shrink-0 mt-0.5" />
        <span>{ins}</span>
      </div>
    ));
  };

  const getDaysUntilUnlock = (unlockDateStr: string) => {
    const diff = new Date(unlockDateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Tab Welcome Header */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-sage-900">Your Reflection Space</h2>
            <p className="text-xs text-sage-600/80">Track your moods, voice your journals, and lock memories away safely</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Mood tracking and Journaling */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Feature 4: Mood Tracking & Insights */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-6 shadow-sm">
            <div className="border-b border-beige-200 pb-3">
              <h3 className="font-serif text-base font-semibold text-sage-900">Mood Tracker</h3>
              <p className="text-xs text-sage-600">How heavy is your heart today?</p>
            </div>

            {moodAdded ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-3xl">🕊️</span>
                <p className="text-sm font-semibold text-sage-900">Thank you for checking in.</p>
                <p className="text-xs text-sage-600">Your emotional weather has been logged in your vault.</p>
              </div>
            ) : (
              <form onSubmit={handleAddMood} className="space-y-4">
                {/* Emoji Selector */}
                <div className="grid grid-cols-5 gap-2">
                  {moodScale.map((m) => {
                    const isSelected = moodValue === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMoodValue(m.value)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? `${m.color} border-sage-500 shadow-sm scale-105`
                            : "bg-white border-beige-200 hover:bg-beige-50/20"
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[9px] font-medium text-sage-800">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600">What happened today?</label>
                  <input
                    type="text"
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="e.g. Walked in the woods, slept 8h, almost checked their socials..."
                    className="w-full px-4 py-3 text-xs bg-white border border-beige-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 text-sage-900 placeholder-sage-500/40 outline-none"
                    maxLength={150}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Log Emotional Weather
                </button>
              </form>
            )}

            {/* Insights Section */}
            <div className="bg-sage-100/30 p-4 rounded-2xl border border-sage-200/50 space-y-3">
              <span className="text-[9px] font-mono uppercase tracking-wider text-sage-700 font-semibold block">Solace Healing Insights</span>
              <div className="space-y-2">
                {typeof generateInsights() === "string" ? (
                  <p className="text-xs text-sage-700/80 italic">{generateInsights()}</p>
                ) : (
                  generateInsights()
                )}
              </div>
            </div>
          </div>

          {/* Feature 5: Personal Journal */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-beige-200 pb-3">
              <div>
                <h3 className="font-serif text-base font-semibold text-sage-900">Personal Journal</h3>
                <p className="text-xs text-sage-600">A secure space to write your raw truth</p>
              </div>
              {!showAddJournal && (
                <button
                  onClick={() => setShowAddJournal(true)}
                  className="py-1.5 px-3 bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Write Entry</span>
                </button>
              )}
            </div>

            {showAddJournal && (
              <form onSubmit={handleAddJournal} className="bg-white p-4 rounded-2xl border border-beige-200 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="Title your reflection..."
                    className="w-full px-3 py-2 text-xs bg-beige-50/20 rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <textarea
                    rows={6}
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Pour your heart onto the page. No spelling corrections, no censorship. Let it run free..."
                    className="w-full p-3 text-xs bg-beige-50/20 rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddJournal(false)}
                    className="py-2 px-3 border border-beige-300 rounded-lg text-xs font-medium text-sage-700 hover:bg-beige-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-sage-500 hover:bg-sage-600 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Save & Encrypt
                  </button>
                </div>
              </form>
            )}

            {/* List of Journal Entries */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {journals.length === 0 ? (
                <div className="text-center py-8 text-xs text-sage-600/70 italic border-2 border-dashed border-beige-200 rounded-2xl">
                  Your journal vault is currently empty. Whenever you're ready, release your heavy thoughts here.
                </div>
              ) : (
                journals.map((entry) => (
                  <div key={entry.id} className="bg-white p-5 rounded-2xl border border-beige-200 space-y-3 shadow-2xs relative group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-sage-500">{entry.date}</span>
                        <h4 className="font-serif text-sm font-semibold text-sage-900 mt-0.5">{entry.title}</h4>
                      </div>
                      <button
                        onClick={() => deleteJournal(entry.id)}
                        className="text-beige-300 hover:text-rose-500 transition-colors p-1"
                        title="Delete journal entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-sage-700/95 leading-relaxed font-sans whitespace-pre-wrap">
                      {entry.content}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono text-sage-500 border-t border-beige-100">
                      <ShieldCheck className="w-3 h-3 text-sage-500" />
                      <span>End-to-End Encrypted Secure Entry</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Memory Box */}
        <div className="md:col-span-5 space-y-8">
          
          {/* Feature 7: Memory Box */}
          <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-beige-200 pb-3">
              <div>
                <h3 className="font-serif text-base font-semibold text-sage-900">Memory Box</h3>
                <p className="text-xs text-sage-600">Store reminders safely until you're ready</p>
              </div>
              {!showAddMemory && (
                <button
                  onClick={() => setShowAddMemory(true)}
                  className="py-1.5 px-3 bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>Deposit</span>
                </button>
              )}
            </div>

            <p className="text-xs text-sage-700/80 leading-relaxed">
              Have photos, old notes, or songs that trigger intense longing? Instead of endlessly revisiting them, place them in this digital container and decide a locking delay. We will protect them for you until the time is right.
            </p>

            {showAddMemory && (
              <form onSubmit={handleAddMemory} className="bg-white p-4 rounded-2xl border border-beige-200 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-sage-600 uppercase">Memory Label</label>
                  <input
                    type="text"
                    value={memoryTitle}
                    onChange={(e) => setMemoryTitle(e.target.value)}
                    placeholder="e.g. Polaroid from summer trip..."
                    className="w-full px-3 py-2 text-xs bg-beige-50/20 rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-sage-600 uppercase">Description / Thoughts</label>
                  <textarea
                    rows={3}
                    value={memoryContent}
                    onChange={(e) => setMemoryContent(e.target.value)}
                    placeholder="Why are you boxing this today? Express your thoughts..."
                    className="w-full p-3 text-xs bg-beige-50/20 rounded-lg border border-beige-200 focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemoryType('note')}
                    className={`py-1.5 text-xs rounded-lg border cursor-pointer font-medium ${
                      memoryType === 'note' ? "border-sage-500 bg-sage-50/50 text-sage-900" : "border-beige-200 text-sage-700"
                    }`}
                  >
                    Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemoryType('photo')}
                    className={`py-1.5 text-xs rounded-lg border cursor-pointer font-medium ${
                      memoryType === 'photo' ? "border-sage-500 bg-sage-50/50 text-sage-900" : "border-beige-200 text-sage-700"
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemoryType('song')}
                    className={`py-1.5 text-xs rounded-lg border cursor-pointer font-medium ${
                      memoryType === 'song' ? "border-sage-500 bg-sage-50/50 text-sage-900" : "border-beige-200 text-sage-700"
                    }`}
                  >
                    Song/Link
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-sage-600 uppercase">Lock Duration</label>
                  <select
                    value={unlockDelayDays}
                    onChange={(e) => setUnlockDelayDays(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-beige-50/20 border border-beige-200 rounded-lg text-sage-800"
                  >
                    <option value={15}>15 Days (Fresh Breath)</option>
                    <option value={30}>30 Days (A Month of Space)</option>
                    <option value={90}>90 Days (Deep Healing)</option>
                    <option value={365}>1 Year (Triumphant Return)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemory(false)}
                    className="py-1.5 px-3 border border-beige-300 rounded-lg text-xs font-medium text-sage-700 hover:bg-beige-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-sage-500 hover:bg-sage-600 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Deposit & Lock
                  </button>
                </div>
              </form>
            )}

            {/* List of Locked Memories */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {memories.length === 0 ? (
                <div className="text-center py-8 text-xs text-sage-600/70 italic border-2 border-dashed border-beige-200 rounded-2xl">
                  The memory box is currently empty.
                </div>
              ) : (
                memories.map((mem) => {
                  const daysLeft = getDaysUntilUnlock(mem.unlockDate);
                  const isLocked = daysLeft > 0;
                  return (
                    <div key={mem.id} className="bg-white p-4 rounded-2xl border border-beige-200 flex items-start gap-4 shadow-2xs relative">
                      <div className={`p-2.5 rounded-xl ${isLocked ? "bg-rose-50 text-rose-500 animate-pulse" : "bg-sage-100 text-sage-600"}`}>
                        {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-semibold text-sage-900">
                            {isLocked ? `Locked Memory Item` : mem.title}
                          </h4>
                          <span className="text-[9px] font-mono uppercase bg-beige-100 px-1.5 py-0.5 rounded text-sage-700 font-medium">{mem.type}</span>
                        </div>
                        
                        {isLocked ? (
                          <p className="text-[11px] text-sage-600 leading-normal">
                            This memory is resting quietly in the vault. Solace is keeping it safe. It will reveal itself in <strong className="text-rose-600 font-bold">{daysLeft} days</strong>.
                          </p>
                        ) : (
                          <>
                            <p className="text-[11px] text-sage-800 font-serif leading-relaxed italic">
                              "{mem.content}"
                            </p>
                            <span className="block text-[9px] text-sage-500 font-mono">Released safely after full reflection cycle</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
