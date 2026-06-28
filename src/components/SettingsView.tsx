import React, { useState } from "react";
import { UserState } from "../types";
import { ShieldCheck, Lock, Unlock, Eye, RefreshCw, Key, Trash2, Heart, Download } from "lucide-react";

interface SettingsProps {
  state: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
  onResetApp: () => void;
}

export default function SettingsView({ state, onUpdateState, onResetApp }: SettingsProps) {
  const { privacy, onboarding } = state;
  const [passcodeInput, setPasscodeInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleTogglePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (privacy.passcodeEnabled) {
      // disable
      onUpdateState({
        privacy: {
          ...privacy,
          passcodeEnabled: false,
          passcode: "",
        },
      });
      setSuccessMsg("Passcode lock disabled successfully.");
    } else {
      // enable
      if (passcodeInput.length < 4) {
        alert("Please enter a secure passcode of at least 4 characters.");
        return;
      }
      onUpdateState({
        privacy: {
          ...privacy,
          passcodeEnabled: true,
          passcode: passcodeInput,
        },
      });
      setPasscodeInput("");
      setSuccessMsg("Secure Passcode lock enabled beautifully.");
    }
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleToggleMemory = () => {
    onUpdateState({
      privacy: {
        ...privacy,
        aiMemoryEnabled: !privacy.aiMemoryEnabled,
      },
    });
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `solace_healing_vault_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const clearAIMemory = () => {
    if (confirm("Are you sure you want to clear Solace's chat memory? This will reset the AI's contextual knowledge about you, but keep your local journals and moods intact.")) {
      onUpdateState({
        chatHistory: [
          {
            id: "welcome-" + Date.now(),
            role: "model",
            text: `Memory cleared. Hello, I'm Solace, your healing companion. How are you holding up today?`,
            createdAt: new Date().toISOString(),
          }
        ]
      });
      alert("AI contextual conversation memory cleared.");
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-sage-900">Privacy & Security</h2>
            <p className="text-xs text-sage-600/80">Manage your private healing vault and sandboxing</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-sage-100 border border-sage-400 text-sage-900 px-4 py-3 rounded-xl text-xs font-semibold text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* Feature 12: Privacy & Trust settings */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-6 shadow-sm">
        
        {/* Passcode toggler */}
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-beige-200 pb-3">
            <div>
              <h3 className="font-serif text-sm font-semibold text-sage-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-sage-600" />
                <span>Private Passcode Lock</span>
              </h3>
              <p className="text-[11px] text-sage-600">Secure your journals, memories, and mood logs from local snoopers</p>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
              privacy.passcodeEnabled ? "bg-sage-100 text-sage-700" : "bg-beige-100 text-sage-600"
            }`}>
              {privacy.passcodeEnabled ? "ON" : "OFF"}
            </span>
          </div>

          <form onSubmit={handleTogglePasscode} className="flex gap-2">
            {!privacy.passcodeEnabled ? (
              <>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Set 4+ digit passcode..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-beige-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage-500 text-sage-900 placeholder-sage-500/40"
                  maxLength={10}
                />
                <button
                  type="submit"
                  disabled={passcodeInput.length < 4}
                  className="py-2 px-4 bg-sage-500 hover:bg-sage-600 disabled:bg-sage-300 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-2xs"
                >
                  Enable Lock
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-2xs"
              >
                Disable Passcode Lock
              </button>
            )}
          </form>
        </div>

        {/* AI Memory Control */}
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-beige-200 pb-3">
            <div>
              <h3 className="font-serif text-sm font-semibold text-sage-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-sage-600" />
                <span>AI Core Context Memory</span>
              </h3>
              <p className="text-[11px] text-sage-600">Allow Solace to remember your onboarding details and name during chats</p>
            </div>
            <button
              onClick={handleToggleMemory}
              className={`text-[10px] font-mono px-3 py-1 rounded font-semibold border cursor-pointer transition-all ${
                privacy.aiMemoryEnabled ? "bg-sage-100 border-sage-400 text-sage-700" : "bg-white border-beige-300 text-sage-600"
              }`}
            >
              {privacy.aiMemoryEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={clearAIMemory}
              className="py-2 px-3 border border-beige-300 rounded-xl text-[10px] font-semibold text-sage-700 hover:bg-beige-50 transition-all cursor-pointer"
            >
              Clear AI Chat History Context
            </button>
          </div>
        </div>

        {/* Data Export and Factory Reset */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-xs font-semibold text-sage-900 border-b border-beige-200 pb-2">Data Control & Backup</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportData}
              className="py-2.5 px-3 bg-white border border-beige-300 hover:bg-beige-50 rounded-xl text-xs font-semibold text-sage-800 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Vault JSON</span>
            </button>
            <button
              onClick={() => {
                if (confirm("WARNING: This will permanently delete your onboarding answers, No Contact timer history, private journal entries, memories, and wellness logs. This cannot be undone! Are you absolutely sure?")) {
                  onResetApp();
                }
              }}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Solace App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manifest of Trust */}
      <div className="bg-cream-50 rounded-3xl border border-beige-200/60 p-6 space-y-4 shadow-sm text-center">
        <span className="text-2xl">🛡️</span>
        <h4 className="font-serif font-bold text-sm text-sage-900">Solace Covenant of Trust</h4>
        <div className="text-left text-[11px] text-sage-700/90 space-y-2 leading-relaxed">
          <p>
            • <strong>Your Data is Yours:</strong> Your private journals, memory locks, and routine states are saved inside a secure server-side JSON sandbox and your local container. We never monetize, scrape, or sell your stories.
          </p>
          <p>
            • <strong>Encrypted Buffer:</strong> The AI Companion operates over TLS secured server proxy routes. The developer key stays hidden inside Google's secure secrets vault, completely safe from browser sniffing.
          </p>
          <p>
            • <strong>No Pressure Ever:</strong> You are fully in control of what is stored. When you hit 'Reset Solace App', everything is permanently purged from the Express sandbox instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
