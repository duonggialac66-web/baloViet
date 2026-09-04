"use client";

import { useState } from "react";

export default function CustomerToggleButton({ customerId, initialActive }: { customerId: string; initialActive: boolean }) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customerId, isActive: !isActive }),
      });
      setIsActive(!isActive);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
      } disabled:opacity-50`}
    >
      {loading ? "Đang xử lý..." : isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
    </button>
  );
}
