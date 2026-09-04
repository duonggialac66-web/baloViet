"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/store/cartContext";
import { ArrowLeft, Save } from "lucide-react";
import ImageInputWithRemover from "@/components/admin/ImageInputWithRemover";


interface PromotionFormProps {
  initialData?: {
    id?: string;
    tag?: string | null;
    badge?: string | null;
    title?: string | null;
    highlight?: string | null;
    description?: string | null;
    code?: string | null;
    discountValue?: string | null;
    minOrder?: string | null;
    giftText?: string | null;
    ctaText?: string | null;
    targetUrl?: string | null;
    imageUrl?: string | null;
    originalPrice?: number | null;
    salePrice?: number | null;
    floatingPerks?: string[] | null;
    sortOrder?: number | null;
    isActive?: boolean | null;
  };
  isEdit?: boolean;
}

export default function PromotionForm({ initialData, isEdit = false }: PromotionFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    highlight: initialData?.highlight || "",
    badge: initialData?.badge || "GIẢM ĐẾN 45%",
    tag: initialData?.tag || "ĐANG DIỄN RA: FLASH SALE MÙA DU LỊCH",
    description: initialData?.description || "",
    code: initialData?.code || "",
    discountValue: initialData?.discountValue || "",
    minOrder: initialData?.minOrder || "",
    giftText: initialData?.giftText || "",
    ctaText: initialData?.ctaText || "SĂN DEAL NGAY",
    targetUrl: initialData?.targetUrl || "/san-pham",
    imageUrl: initialData?.imageUrl || "/hero-backpack.png",
    originalPrice: initialData?.originalPrice || "",
    salePrice: initialData?.salePrice || "",
    floatingPerks: Array.isArray(initialData?.floatingPerks)
      ? initialData.floatingPerks.join("\n")
      : "",
    sortOrder: (initialData?.sortOrder !== undefined && initialData?.sortOrder !== null) ? initialData.sortOrder : 0,
    isActive: (initialData?.isActive !== undefined && initialData?.isActive !== null) ? Boolean(initialData.isActive) : true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.badge || !formData.imageUrl) {
      addToast("Vui lòng điền đủ Tiêu đề, Huy hiệu và Link ảnh", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...(isEdit ? { id: initialData?.id } : {}),
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        sortOrder: Number(formData.sortOrder) || 0,
        floatingPerks: formData.floatingPerks
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      };

      const res = await fetch("/api/admin/promotions", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      addToast(
        isEdit ? "Cập nhật chương trình ưu đãi thành công!" : "Tạo chương trình ưu đãi mới thành công!",
        "success"
      );
      router.push("/admin/uu-dai");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Thao tác thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <Link
          href="/admin/uu-dai"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-sm disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" /> {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo ưu đãi"}
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO BACKGROUND BANNER UPLOAD & PREVIEW */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            🖼️ Hình nền Background của Chương Trình Ưu Đãi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Đây là ảnh nền Banner khổ rộng (Full Hero Background) sẽ phủ toàn bộ khung Hero Section khi khách hàng chọn chương trình này.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Banner Upload / Input Box */}
          <div className="lg:col-span-7 space-y-4">
            <ImageInputWithRemover
              label="Đường dẫn ảnh Background Banner (URL / Cloudinary / Tách Nền AI)"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={(newUrl) => setFormData((prev) => ({ ...prev, imageUrl: newUrl }))}
              placeholder="https://images.unsplash.com/... hoặc /hero-banner.png"
              required
              helpText="Khuyên dùng ảnh chất lượng cao (1600x900px trở lên) hoặc ảnh banner bộ sưu tập"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn gọn về ưu đãi</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Ví dụ: Công nghệ sợi vải thông minh giúp tản nhiệt vượt trội, giảm nhiệt tức thì..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Full Banner Live Preview */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Xem trước Hero Banner</span>
            <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-cyan-500/50 shadow-xl bg-gray-950 flex flex-col justify-between p-4 text-white">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Hero Background Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-xs text-gray-500">Chưa chọn ảnh background</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

              {/* Tag overlay preview */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-bold text-white uppercase">
                  {formData.tag || "TAG BỘ SƯU TẬP"}
                </span>
                {formData.discountValue && (
                  <span className="px-2.5 py-0.5 rounded bg-[#FFB800] text-black font-black text-[10px] uppercase">
                    {formData.discountValue}
                  </span>
                )}
              </div>

              {/* Title preview */}
              <div className="relative z-10 space-y-1">
                <h3 className="font-extrabold text-lg text-white uppercase leading-tight drop-shadow">
                  {formData.title || "TÊN CHƯƠNG TRÌNH"}
                </h3>
                <div className="rounded-lg border border-cyan-400/50 bg-cyan-950/90 p-2 flex items-center justify-between text-xs text-cyan-200">
                  <span className="font-bold uppercase">{formData.badge || "ICEVIBES™"}</span>
                  <span className="text-[10px] text-cyan-300 font-mono">{formData.highlight || "HOT DEAL"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PROGRAM DETAILS & VOUCHER */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Thông tin chi tiết & Mã Voucher</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên chương trình / Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ví dụ: BỘ SƯU TẬP ICEVIBES"
              required
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Huy hiệu công nghệ (Badge) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              placeholder="Ví dụ: ICEVIBES™ hoặc RAINSHIELD™"
              required
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm nhấn ngắn (Highlight)</label>
            <input
              type="text"
              name="highlight"
              value={formData.highlight}
              onChange={handleChange}
              placeholder="Ví dụ: Sợi Siêu Nhẹ Làm Mát 360°"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag loại chương trình</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              placeholder="Ví dụ: CÔNG NGHỆ LÀM MÁT"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã Voucher (Nếu có)</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ví dụ: ICEVIBES100K"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hiển thị mức giảm giá</label>
            <input
              type="text"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder="Ví dụ: Giảm 100K hoặc Giảm 15%"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (VND)</label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              placeholder="Ví dụ: 890000"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc chưa giảm (VND)</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="Ví dụ: 1290000"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nút bấm CTA</label>
            <input
              type="text"
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              placeholder="Ví dụ: SĂN DEAL NGAY"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn khi click (Target URL)</label>
            <input
              type="text"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
              placeholder="Ví dụ: /san-pham?tag=icevibes"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: DISPLAY SETTINGS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">Thứ tự hiển thị trên Hero</label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder ?? 0}
            onChange={handleChange}
            placeholder="0, 1, 2..."
            className="w-36 px-3.5 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
          />
          <label htmlFor="isActive" className="text-sm font-bold text-gray-900 cursor-pointer">
            Kích hoạt hiển thị chương trình ưu đãi này trên Hero Section
          </label>
        </div>
      </div>

      {/* Footer submit */}
      <div className="flex justify-end gap-4">
        <Link
          href="/admin/uu-dai"
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Hủy bỏ
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-bold shadow-sm disabled:opacity-50 text-sm"
        >
          {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo ưu đãi"}
        </button>
      </div>
    </form>
  );
}
