import { ReactNode } from "react";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipping" | "delivered" | "completed" | "cancelled" | "returned";

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (s: OrderStatus) => {
    switch (s) {
      case "pending": return { label: "Chờ xác nhận", classes: "bg-yellow-100 text-yellow-800" };
      case "confirmed": return { label: "Đã xác nhận", classes: "bg-blue-100 text-blue-800" };
      case "processing": return { label: "Đang xử lý", classes: "bg-indigo-100 text-indigo-800" };
      case "shipping": return { label: "Đang giao", classes: "bg-purple-100 text-purple-800" };
      case "delivered": return { label: "Đã giao", classes: "bg-green-100 text-green-800" };
      case "completed": return { label: "Hoàn tất", classes: "bg-emerald-100 text-emerald-800" };
      case "cancelled": return { label: "Đã hủy", classes: "bg-red-100 text-red-800" };
      case "returned": return { label: "Hoàn trả", classes: "bg-gray-100 text-gray-800" };
      default: return { label: "Không rõ", classes: "bg-gray-100 text-gray-800" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
