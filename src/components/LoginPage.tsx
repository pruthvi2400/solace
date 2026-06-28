import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Heart, Lock, Mail } from "lucide-react";

interface LoginPageProps {
  onTogglePage: () => void;
}

export default function LoginPage({ onTogglePage }: LoginPageProps) {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    clearError();

    const success = await login(email, password);
    if (!success) {
      setLoginError(error || "Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-100 px-4">
      <div className="bg-cream-50 rounded-3xl border border-beige-200 p-8 max-w-md w-full shadow-lg space-y-6">
        
        {/* Brand/Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-sage-500 text-white rounded-2xl flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-sage-950">Welcome to Solace</h2>
          <p className="text-xs text-sage-600">Your quiet space for emotional healing and reflections</p>
        </div>

        {/* Error Notification */}
        {(loginError || error) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center font-medium">
            {loginError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600 font-semibold block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sage-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-beige-300 text-sm text-sage-900 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600 font-semibold block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sage-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-beige-300 text-sm text-sage-900 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sage-500 hover:bg-sage-600 disabled:bg-sage-400 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Opening sanctuary..." : "Enter Solace"}
          </button>
        </form>

        {/* Toggle Signup */}
        <div className="text-center pt-2 border-t border-beige-200">
          <p className="text-xs text-sage-600">
            First time visiting?{" "}
            <button
              onClick={onTogglePage}
              className="text-sage-700 font-semibold hover:underline bg-transparent border-none cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
