"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/store/cartContext";

interface OrderActionsProps {
  orderId: string;
  initialStatus: string;
}

export default function OrderActions({ orderId, initialStatus }: OrderActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Hủy đơn hàng thành công!", "success");
        setStatus("cancelled");
        router.refresh();
      } else {
        addToast(data.error || "Hủy đơn hàng thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Lỗi kết nối mạng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceived = async () => {
    if (!confirm("Xác nhận bạn đã nhận được gói hàng này?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/received`, {
        method: "PUT",
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Xác nhận đã nhận hàng thành công!", "success");
        setStatus("completed");
        router.refresh();
      } else {
        addToast(data.error || "Thao tác thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Lỗi kết nối mạng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-4">
      {status === "pending" && (
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="border border-red-500/50 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded font-display font-bold text-xs text-red-400 uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : "Hủy đơn hàng"}
        </button>
      )}

      {status === "shipping" && (
        <button
          onClick={handleReceived}
          disabled={isSubmitting}
          className="bg-brand-gold border border-brand-gold hover:bg-white hover:border-white text-black px-5 py-2.5 rounded font-display font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : "Đã nhận được hàng"}
        </button>
      )}
    </div>
  );
}
