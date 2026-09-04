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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đánh giá</h1>
        <p className="text-gray-500 mt-2">{reviews.length} đánh giá. Duyệt hoặc từ chối đánh giá của khách hàng.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">Chưa có đánh giá nào.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{review.user?.fullName || "Ẩn danh"}</span>
                    <span className="text-xs text-gray-500">{review.user?.email}</span>
                    {review.isVerified && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Đã mua</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${review.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {review.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4" fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">Sản phẩm: {review.productId}</span>
                  </div>
                  {review.title && <p className="font-medium">{review.title}</p>}
                  {review.content && <p className="text-sm text-gray-600">{review.content}</p>}
                  <p className="text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN") : ""}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!review.isApproved && (
                    <button onClick={() => handleApprove(review.id, true)} className="p-2 text-green-600 border border-green-200 rounded-md hover:bg-green-50" title="Duyệt">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {review.isApproved && (
                    <button onClick={() => handleApprove(review.id, false)} className="p-2 text-yellow-600 border border-yellow-200 rounded-md hover:bg-yellow-50" title="Bỏ duyệt">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="p-2 text-red-500 border border-red-200 rounded-md hover:bg-red-50" title="Xóa">
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
