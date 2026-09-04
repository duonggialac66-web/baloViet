"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/store/cartContext";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  role: "customer" | "admin";
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, hasSession = true }: { children: React.ReactNode; hasSession?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(hasSession); // only loading if we have a session to check
  const { addToast } = useToast();
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasSession) {
      refreshUser();
    }
  }, []);

  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        setUser(null);
        addToast("Đã đăng xuất tài khoản", "info");
        router.push("/");
        return true;
      } else {
        addToast("Không thể đăng xuất. Vui lòng thử lại.", "error");
        return false;
      }
    } catch (err) {
      console.error("Logout request error:", err);
      addToast("Lỗi kết nối khi đăng xuất.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
