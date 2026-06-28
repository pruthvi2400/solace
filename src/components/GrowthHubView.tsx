import React, { useState } from "react";
import { UserState, GoalItem } from "../types";
import { Sparkles, Trophy, Plus, Compass, ChevronRight, Check, Trash2 } from "lucide-react";

interface GrowthHubProps {
  state: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
}

export default function GrowthHubView({ state, onUpdateState }: GrowthHubProps) {
  const { goals } = state;
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("mind");

  const categories = [
    { value: "mind", label: "Mind & Studies" },
    { value: "body", label: "Body & Fitness" },
    { value: "growth", label: "Skills & Career" },
    { value: "environment", label: "Living Space" },
    { value: "social", label: "Friends & Social" },
  ];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: GoalItem = {
      id: "goal-" + Date.now(),
      title: goalTitle.trim(),
      category: goalCategory,
      progress: 0,
    };

    onUpdateState({
      goals: [...goals, newGoal],
    });

    setGoalTitle("");
    setShowAddGoal(false);
  };

  const incrementProgress = (id: string, amount: number) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextProgress = Math.min(100, Math.max(0, g.progress + amount));
        return { ...g, progress: nextProgress };
      }
      return g;
    });
    onUpdateState({ goals: updated });
  };

  const deleteGoal = (id: string) => {
    if (confirm("Would you like to archive this goal?")) {
      onUpdateState({
        goals: goals.filter((g) => g.id !== id),
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Welcome Header */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-sage-900">Personal Growth Hub</h2>
            <p className="text-xs text-sage-600/80">Set meaningful milestones and design a life beyond heartbreak</p>
          </div>
        </div>
        {!showAddGoal && (
          <button
            onClick={() => setShowAddGoal(true)}
            className="py-2.5 px-4 bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Goal</span>
          </button>
        )}
      </div>

      {/* Philosophy Callout */}
      <div className="bg-white p-5 rounded-3xl border border-beige-200/50 flex items-start gap-4 shadow-2xs">
        <div className="p-2.5 bg-lavender-50 rounded-2xl text-lavender-500">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-sm text-sage-900">Life Grows in Many Directions</h4>
          <p className="text-xs text-sage-700/80 leading-relaxed">
            While parts of your heart are still healing, other parts of you are ready to expand. Taking up a language, exercising, or organizing your desk are powerful signals to your subconscious that you are building a thriving, independent future.
          </p>
        </div>
      </div>

      {showAddGoal && (
        <form onSubmit={handleAddGoal} className="bg-cream-50 rounded-3xl border border-beige-200 p-6 max-w-xl mx-auto space-y-4 shadow-sm">
          <h3 className="font-serif text-base font-semibold text-sage-900">Set a Growth Anchor</h3>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600">What are you building?</label>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Read 2 chapters of psychology books, go to the gym 3x a week..."
              className="w-full px-4 py-2.5 text-xs bg-white border border-beige-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setGoalCategory(cat.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    goalCategory === cat.value
                      ? "border-sage-500 bg-sage-50/50 text-sage-950"
                      : "border-beige-200 bg-white text-sage-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="py-2 px-4 border border-beige-300 rounded-xl text-xs font-medium text-sage-700 hover:bg-beige-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              Anchor Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal list grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 text-xs text-sage-600/70 italic border-2 border-dashed border-beige-200 rounded-3xl">
            You don't have any growth goals active. Tap 'Set New Goal' to plant a new seed.
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="bg-cream-50 rounded-2xl border border-beige-200/60 p-5 space-y-4 shadow-3xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[9px] font-mono uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded text-sage-600 border border-beige-200">
                    {goal.category}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-beige-300 hover:text-rose-500 transition-colors text-xs"
                  >
                    Archive
                  </button>
                </div>
                <h3 className="font-serif text-sm font-semibold text-sage-900 leading-snug">
                  {goal.title}
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-sage-600">Progress Tracker</span>
                  <span className="text-sage-900 font-bold">{goal.progress}%</span>
                </div>
                
                {/* Progress bar container */}
                <div className="w-full bg-beige-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sage-500 h-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>

                {/* Progress Increment/Decrement controls */}
                <div className="flex gap-1.5 justify-end pt-1">
                  <button
                    onClick={() => incrementProgress(goal.id, -10)}
                    disabled={goal.progress <= 0}
                    className="px-2.5 py-1 bg-white border border-beige-200 rounded-lg text-xs font-semibold hover:border-sage-400 disabled:opacity-50 cursor-pointer"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => incrementProgress(goal.id, 10)}
                    disabled={goal.progress >= 100}
                    className="px-2.5 py-1 bg-white border border-beige-200 rounded-lg text-xs font-semibold hover:border-sage-400 disabled:opacity-50 cursor-pointer"
                  >
                    +10%
                  </button>
                  {goal.progress >= 100 && (
                    <span className="text-[10px] bg-sage-100 text-sage-700 font-bold rounded-lg px-2.5 py-1 border border-sage-200 flex items-center gap-1 animate-bounce">
                      <Check className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
