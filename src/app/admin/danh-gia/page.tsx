"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, Star } from "lucide-react";

interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved: boolean | null;
  isVerified: boolean | null;
  createdAt: string | null;
  user: { fullName: string | null; email: string | null };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (reviewId: string, isApproved: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, isApproved }),
    });
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    fetchReviews();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#121417] p-6 rounded-2xl border border-[#22242B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">Quản lý Đánh giá</h1>
          <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 font-sans">{reviews.length} đánh giá. Duyệt hoặc từ chối đánh giá của khách hàng.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-[#121417] rounded-2xl border border-[#22242B] p-12 text-center text-[#9CA3AF] text-sm font-sans">Chưa có đánh giá nào.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#121417] rounded-2xl border border-[#22242B] p-6 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm font-sans">{review.user?.fullName || "Ẩn danh"}</span>
                    <span className="text-xs text-[#9CA3AF] font-mono">{review.user?.email}</span>
                    {review.isVerified && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">Đã mua</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${review.isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                      {review.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#F5B800]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4" fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                    <span className="text-xs text-[#9CA3AF] font-mono ml-2">Sản phẩm: {review.productId}</span>
                  </div>
                  {review.title && <p className="font-bold text-white text-sm">{review.title}</p>}
                  {review.content && <p className="text-xs text-gray-300 font-sans leading-relaxed">{review.content}</p>}
                  <p className="text-[10px] text-[#9CA3AF] font-mono">{review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN") : ""}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!review.isApproved && (
                    <button onClick={() => handleApprove(review.id, true)} className="p-2 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-colors" title="Duyệt">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {review.isApproved && (
                    <button onClick={() => handleApprove(review.id, false)} className="p-2 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition-colors" title="Bỏ duyệt">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="p-2 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/10 transition-colors" title="Xóa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
