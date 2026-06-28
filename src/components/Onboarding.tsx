import React, { useState } from "react";
import { OnboardingAnswers } from "../types";
import { Sparkles, Heart, Compass, Moon, Smile, ArrowRight, User } from "lucide-react";

interface OnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [feeling, setFeeling] = useState("hurting");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const feelings = [
    { value: "hurting", label: "Hurting", emoji: "💔", desc: "A raw, tender pain that won't go away." },
    { value: "numb", label: "Numb", emoji: "🌫️", desc: "Feeling distant, disconnected, or blank." },
    { value: "angry", label: "Angry", emoji: "🔥", desc: "Frustrated, resentful, or feeling betrayed." },
    { value: "lonely", label: "Lonely", emoji: "🌌", desc: "The quiet weight of empty spaces." },
    { value: "anxious", label: "Anxious", emoji: "🌱", desc: "Worrying about what comes next." },
    { value: "peaceful", label: "Peaceful", emoji: "✨", desc: "Ready to slowly rebuild and step forward." },
  ];

  const reasons = [
    "Breakup",
    "Divorce",
    "Friendship ending",
    "Unrequited love",
    "Grief & bereavement",
    "Loneliness",
    "Something else"
  ];

  const goals = [
    "Stop texting my ex",
    "Feel happier day-to-day",
    "Sleep better and find peace",
    "Build confidence and self-worth",
    "Get back to studying/working",
    "Exercise and self-care consistently",
    "Discover new hobbies",
    "Practice forgiveness"
  ];

  const handleToggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleToggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete({
        name: name.trim() || "Friend",
        reasons: selectedReasons,
        feeling,
        goals: selectedGoals,
        onboarded: true,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-100 px-4 py-8">
      <div className="max-w-xl w-full bg-cream-50 rounded-3xl border border-beige-200 shadow-sm p-8 md:p-12 relative overflow-hidden">
        {/* Decorative subtle background glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-sage-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-lavender-200/40 rounded-full blur-3xl"></div>

        {/* Progress bar */}
        <div className="w-full bg-beige-200 h-1 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-sage-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-sage-600 tracking-wider uppercase">Welcome to Solace</span>
              <h1 className="font-serif text-3xl md:text-4xl text-sage-900 tracking-tight">What shall I call you?</h1>
              <p className="text-sm text-sage-700/80 max-w-sm mx-auto">
                Your journey here is entirely confidential. Choose a name, nickname, or pseudonym that feels comfortable.
              </p>
            </div>

            <div className="relative mt-8">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-beige-300 bg-white text-sage-900 placeholder-sage-500/40 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                maxLength={30}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full mt-6 py-4 px-6 rounded-xl font-medium bg-sage-500 hover:bg-sage-600 disabled:bg-sage-300 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Begin Your Healing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Feeling right now */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-sage-600 tracking-wider uppercase">Step 2 of 5</span>
              <h2 className="font-serif text-3xl text-sage-900 tracking-tight">How are you feeling right now?</h2>
              <p className="text-sm text-sage-700/80">
                Take a quiet moment to check in with yourself. Every feeling is a valid part of the path.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {feelings.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFeeling(f.value)}
                  className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                    feeling === f.value
                      ? "border-sage-500 bg-sage-50/50 shadow-sm"
                      : "border-beige-200 bg-white hover:bg-beige-50/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{f.emoji}</span>
                    <div>
                      <h4 className="font-medium text-sage-900 text-sm">{f.label}</h4>
                      <p className="text-xs text-sage-600/75 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="w-1/3 py-4 border border-beige-300 rounded-xl font-medium text-sage-700 hover:bg-beige-50 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 py-4 rounded-xl font-medium bg-sage-500 hover:bg-sage-600 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: What brings you here */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-sage-600 tracking-wider uppercase">Step 3 of 5</span>
              <h2 className="font-serif text-3xl text-sage-900 tracking-tight">What are you healing from?</h2>
              <p className="text-sm text-sage-700/80">
                Identifying your loss helps Solace gently shape your healing reminders. Select all that apply.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {reasons.map((reason) => {
                const isSelected = selectedReasons.includes(reason);
                return (
                  <button
                    key={reason}
                    onClick={() => handleToggleReason(reason)}
                    className={`px-4 py-3 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sage-500 border-sage-500 text-white shadow-sm"
                        : "bg-white border-beige-300 text-sage-700 hover:border-sage-400"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="w-1/3 py-4 border border-beige-300 rounded-xl font-medium text-sage-700 hover:bg-beige-50 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 py-4 rounded-xl font-medium bg-sage-500 hover:bg-sage-600 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-sage-600 tracking-wider uppercase">Step 4 of 5</span>
              <h2 className="font-serif text-3xl text-sage-900 tracking-tight">What are your personal goals?</h2>
              <p className="text-sm text-sage-700/80">
                Let's set some anchors. We will help you build calm routines around these goals. Select all that apply.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => handleToggleGoal(goal)}
                    className={`p-3 text-left rounded-xl border text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? "border-sage-500 bg-sage-50/50 text-sage-900 shadow-sm"
                        : "border-beige-200 bg-white hover:bg-beige-50/30 text-sage-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-sage-500 bg-sage-500 text-white" : "border-beige-300"
                    }`}>
                      {isSelected && <span className="text-[10px]">✓</span>}
                    </div>
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="w-1/3 py-4 border border-beige-300 rounded-xl font-medium text-sage-700 hover:bg-beige-50 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 py-4 rounded-xl font-medium bg-sage-500 hover:bg-sage-600 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Preparing Plan */}
        {step === 5 && (
          <div className="space-y-6 text-center py-6">
            <span className="text-xs font-mono text-sage-600 tracking-wider uppercase">Your Solace Companion</span>
            <div className="relative w-24 h-24 mx-auto my-6">
              <div className="absolute inset-0 rounded-full border-4 border-sage-100 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center">
                <Heart className="w-10 h-10 text-sage-500 animate-pulse" />
              </div>
            </div>

            <h2 className="font-serif text-3xl text-sage-900 tracking-tight">Creating your healing cocoon...</h2>
            <div className="max-w-md mx-auto space-y-4 text-sm text-sage-700/80 leading-relaxed">
              <p>
                Hello <strong className="text-sage-900 font-medium">{name}</strong>, thank you for sharing your heart with me. I see you are healing from{" "}
                {selectedReasons.length > 0 ? selectedReasons.join(" & ") : "grief"}.
              </p>
              <p>
                We have tailored your companion guide. We'll track your wellness checklist, stand guard over your No Contact timer, hold your heavy thoughts in the secure journal, and check in on you every single day.
              </p>
              <p className="italic font-serif text-sage-600">
                "No matter how dark the storm is, you do not have to walk through it alone."
              </p>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={handleBack}
                className="w-1/3 py-4 border border-beige-300 rounded-xl font-medium text-sage-700 hover:bg-beige-50 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 py-4 rounded-xl font-medium bg-sage-500 hover:bg-sage-600 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Enter Solace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
