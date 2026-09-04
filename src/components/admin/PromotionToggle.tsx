"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/store/cartContext";

interface PromotionToggleProps {
  id: string;
  initialActive: boolean;
}

export default function PromotionToggle({ id, initialActive }: PromotionToggleProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !isActive;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: nextState }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      setIsActive(nextState);
      addToast(
        nextState
          ? "Đã kích hoạt hiển thị ưu đãi trên Hero"
          : "Đã ẩn ưu đãi khỏi Hero",
        "success"
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast("Không thể cập nhật trạng thái ưu đãi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isActive ? "bg-amber-600" : "bg-gray-300"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isActive ? "Đang hiển thị trên Hero (Bấm để ẩn)" : "Đang ẩn (Bấm để hiển thị)"}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isActive ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
