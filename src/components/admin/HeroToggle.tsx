"use client";

import { useState } from "react";
import { useToast } from "@/store/cartContext";

export default function HeroToggle({ productId, initialIsFeatured }: { productId: string, initialIsFeatured: boolean }) {
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const toggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/hero`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHeroFeatured: !isFeatured }),
      });
      
      if (res.ok) {
        setIsFeatured(!isFeatured);
        addToast(
          !isFeatured ? "Đã thêm vào Hero Section" : "Đã gỡ khỏi Hero Section",
          "success"
        );
      } else {
        throw new Error("Lỗi cập nhật");
      }
    } catch (err) {
      console.error(err);
      addToast("Không thể cập nhật trạng thái Hero", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isFeatured 
          ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" 
          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
      }`}
    >
      {isLoading ? "..." : (isFeatured ? "★ Hero" : "☆ Hero")}
    </button>
  );
}
