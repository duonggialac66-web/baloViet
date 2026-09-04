"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/store/cartContext";

export default function PromotionDeleteButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chương trình ưu đãi "${title}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promotions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Xóa thất bại");

      addToast(`Đã xóa ưu đãi "${title}"`, "success");
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast("Không thể xóa chương trình ưu đãi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      title="Xóa ưu đãi"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
