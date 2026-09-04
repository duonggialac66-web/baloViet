"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/store/cartContext";
import { validatePassword } from "@/lib/validations";

export default function DoiMatKhauPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");

  const { addToast } = useToast();

  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength("");
      return;
    }
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (newPassword.length >= 8 && hasUppercase && hasNumber && hasSpecial) {
      setPasswordStrength("strong");
    } else if (newPassword.length >= 8 && hasUppercase && hasNumber) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Front-end validation
    if (!validatePassword(newPassword)) {
      setFormError("Mật khẩu mới phải từ 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số");
      return;
    }

    if (newPassword === currentPassword) {
      setFormError("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Đổi mật khẩu thành công!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setFormError(data.error || "Đổi mật khẩu thất bại");
        addToast(data.error || "Đổi mật khẩu thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      setFormError("Lỗi kết nối mạng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-tight">
          Đổi mật khẩu
        </h1>
        <div className="w-12 h-1 bg-brand-gold mt-2" />
      </div>

      {formError && (
        <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-200 text-xs rounded text-center font-body">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-widest text-brand-subdued mb-2">
            Mật khẩu hiện tại *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-brand-muted border border-brand-border text-white px-4 py-2.5 rounded outline-none focus:border-brand-gold transition-colors font-body text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-widest text-brand-subdued mb-2">
            Mật khẩu mới *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full bg-brand-muted border border-brand-border text-white px-4 py-2.5 rounded outline-none focus:border-brand-gold transition-colors font-body text-sm"
          />

          {/* Password strength indicators */}
          {passwordStrength && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-brand-subdued font-body font-medium uppercase tracking-wider">
                Độ mạnh:
              </span>
              <div className="flex gap-1 flex-1 max-w-[120px]">
                <div className={`h-1 flex-1 rounded ${passwordStrength === "weak" ? "bg-red-500" : passwordStrength === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                <div className={`h-1 flex-1 rounded ${passwordStrength === "weak" ? "bg-neutral-800" : passwordStrength === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                <div className={`h-1 flex-1 rounded ${passwordStrength === "strong" ? "bg-green-500" : "bg-neutral-800"}`} />
              </div>
              <span className={`text-[10px] font-bold font-body uppercase ${passwordStrength === "weak" ? "text-red-500" : passwordStrength === "medium" ? "text-yellow-500" : "text-green-500"}`}>
                {passwordStrength === "weak" ? "Yếu" : passwordStrength === "medium" ? "Trung bình" : "Mạnh"}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-widest text-brand-subdued mb-2">
            Xác nhận mật khẩu mới *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-brand-muted border border-brand-border text-white px-4 py-2.5 rounded outline-none focus:border-brand-gold transition-colors font-body text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="accent-brand-gold h-4 w-4 rounded"
          />
          <label htmlFor="showPassword" className="text-xs text-brand-cream font-body select-none">
            Hiển thị mật khẩu
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gold hover:bg-white text-black font-display font-bold uppercase tracking-widest text-sm py-3.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu →"}
        </button>
      </form>
    </div>
  );
}
