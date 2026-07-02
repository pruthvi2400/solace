import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Heart, Lock, Mail, User } from "lucide-react";

interface SignupPageProps {
  onTogglePage: () => void;
}

export default function SignupPage({ onTogglePage }: SignupPageProps) {
  const { register, error, clearError, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupError("");
    clearError();

    if (password !== confirmPassword) {
      setSignupError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate("/onboarding");
    } else {
      setSignupError(error || "Signup failed. Please try again with a valid/unique email.");
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
          <h2 className="font-serif text-2xl font-bold text-sage-950">Begin Your Journey</h2>
          <p className="text-xs text-sage-600">Step into a secure, companionate space of healing</p>
        </div>

        {/* Error Notification */}
        {(signupError || error) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center font-medium">
            {signupError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600 font-semibold block">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sage-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should Solace address you?"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-beige-300 text-sm text-sage-900 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500"
                required
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-beige-300 text-sm text-sage-900 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-sage-600 font-semibold block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sage-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating your quiet place..." : "Begin Your Solace"}
          </button>
        </form>

        {/* Toggle Login */}
        <div className="text-center pt-2 border-t border-beige-200">
          <p className="text-xs text-sage-600">
            Already have an account?{" "}
            <button
              onClick={onTogglePage}
              className="text-sage-700 font-semibold hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
