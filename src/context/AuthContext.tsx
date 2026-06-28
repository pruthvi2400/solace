import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage (or check HttpOnly cookies via /me API request)
    const checkUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setUser({
            id: data.data._id,
            name: data.data.name,
            email: data.data.email,
            createdAt: data.data.createdAt,
          });
        } else {
          // Token is invalid/expired
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("Error validating session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const clearError = () => setError(null);

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        // Fetch current user details
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success && meData.data) {
          setUser({
            id: meData.data._id,
            name: meData.data.name,
            email: meData.data.email,
            createdAt: meData.data.createdAt,
          });
        }
        setLoading(false);
        return true;
      } else {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError("An unexpected error occurred during signup.");
      setLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        // Fetch current user details
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success && meData.data) {
          setUser({
            id: meData.data._id,
            name: meData.data.name,
            email: meData.data.email,
            createdAt: meData.data.createdAt,
          });
        }
        setLoading(false);
        return true;
      } else {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError("An unexpected error occurred during login.");
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout");
    } catch (err) {
      console.error("Logout error on backend:", err);
    }
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
