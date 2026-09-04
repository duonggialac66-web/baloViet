"use client";

import React, { useState } from "react";
import { useAuth } from "@/store/authContext";
import { useToast } from "@/store/cartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/tai-khoan";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Đăng nhập thành công!", "success");
        await refreshUser();
        router.push(redirectUrl);
      } else {
        setError(data.error || "Đăng nhập thất bại");
        addToast(data.error || "Đăng nhập thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi kết nối");
      addToast("Lỗi kết nối mạng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-brand-card border border-brand-border rounded-lg shadow-xl">
      <div className="text-center mb-8">
        <h2 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-wider">
          Đăng nhập tài khoản
        </h2>
        <div className="w-12 h-1 bg-brand-gold mx-auto mt-2" />
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-950/50 border border-red-500/50 text-red-200 text-sm rounded text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-widest text-brand-subdued mb-2">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="w-full bg-brand-muted border border-brand-border text-white px-4 py-3 rounded outline-none focus:border-brand-gold transition-colors font-body text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-body font-semibold uppercase tracking-widest text-brand-subdued">
              Mật khẩu *
            </label>
            <Link
              href="/quen-mat-khau"
              className="text-[11px] font-body text-brand-gold hover:text-white transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-brand-muted border border-brand-border text-white pl-4 pr-12 py-3 rounded outline-none focus:border-brand-gold transition-colors font-body text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-subdued hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gold hover:bg-white text-black font-display font-bold uppercase tracking-widest text-sm py-3.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập →"
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs font-body text-brand-subdued">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-brand-gold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
