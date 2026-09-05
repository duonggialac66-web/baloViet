"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/store/cartContext";
import {
  ArrowLeft, Save, Leaf, ArrowRight, Move, Eye,
  ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown,
  ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon,
  Sliders, Maximize2
} from "lucide-react";
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
    giftText?: string | null; // Stores JSON transform: {"x":80,"y":50,"scale":1.2} or "center right"
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

const positionPresets = [
  { label: "Trái Trên", x: 15, y: 15 },
  { label: "Giữa Trên", x: 50, y: 15 },
  { label: "Phải Trên", x: 85, y: 15 },
  { label: "Trái Giữa", x: 15, y: 50 },
  { label: "Chính Giữa", x: 50, y: 50 },
  { label: "Phải Giữa (Chuẩn)", x: 85, y: 50 },
  { label: "Trái Dưới", x: 15, y: 85 },
  { label: "Giữa Dưới", x: 50, y: 85 },
  { label: "Phải Dưới", x: 85, y: 85 },
];

export default function PromotionForm({ initialData, isEdit = false }: PromotionFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Parse initial transform if present in giftText
  const parseInitialTransform = () => {
    const raw = initialData?.giftText;
    if (!raw) return { x: 85, y: 50, scale: 1.0 };
    try {
      if (raw.startsWith("{")) {
        const p = JSON.parse(raw);
        return {
          x: p.x !== undefined ? Number(p.x) : 85,
          y: p.y !== undefined ? Number(p.y) : 50,
          scale: p.scale !== undefined ? Number(p.scale) : 1.0,
        };
      }
      if (raw.includes("left")) return { x: 15, y: 50, scale: 1.0 };
      if (raw.includes("right")) return { x: 85, y: 50, scale: 1.0 };
      if (raw.includes("center")) return { x: 50, y: 50, scale: 1.0 };
    } catch (e) {
      // fallback
    }
    return { x: 85, y: 50, scale: 1.0 };
  };

  const initialTransform = parseInitialTransform();
  const [posX, setPosX] = useState(initialTransform.x);
  const [posY, setPosY] = useState(initialTransform.y);
  const [zoomScale, setZoomScale] = useState(initialTransform.scale);

  const [formData, setFormData] = useState({
    title: initialData?.title || "ĐỔI BALO CŨ\nNHẬN NGAY",
    highlight: initialData?.highlight || "TRỢ GIÁ",
    badge: initialData?.badge || "ĐỔI BALO CŨ NHẬN NGAY",
    tag: initialData?.tag || "HÀNH TRÌNH XANH",
    description: initialData?.description || "Đổi balo cũ bất kỳ nhận ngay voucher trợ giá 200.000đ nâng cấp lên dòng Balo Việt chất liệu vải sợi tái chế 900D siêu bền bỉ.",
    code: initialData?.code || "ECO200",
    discountValue: initialData?.discountValue || "200.000Đ",
    minOrder: initialData?.minOrder || "",
    ctaText: initialData?.ctaText || "THAM GIA NGAY",
    targetUrl: initialData?.targetUrl || "/san-pham",
    imageUrl: initialData?.imageUrl || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&h=1080&fit=crop&auto=format",
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

  // Drag interaction to pan image directly on preview canvas
  const updatePositionFromEvent = (clientX: number, clientY: number) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((clientY - rect.top) / rect.height) * 100)));
    setPosX(x);
    setPosY(y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updatePositionFromEvent(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePositionFromEvent(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleNudge = (deltaX: number, deltaY: number) => {
    setPosX((prev) => Math.min(100, Math.max(0, prev + deltaX)));
    setPosY((prev) => Math.min(100, Math.max(0, prev + deltaY)));
  };

  const handleResetTransform = () => {
    setPosX(85);
    setPosY(50);
    setZoomScale(1.0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      addToast("Vui lòng điền đủ Tiêu đề và Link ảnh", "error");
      return;
    }

    setLoading(true);
    try {
      // Encode transform config into giftText field
      const transformJson = JSON.stringify({
        x: posX,
        y: posY,
        scale: Number(zoomScale.toFixed(2)),
      });

      const payload = {
        ...(isEdit ? { id: initialData?.id } : {}),
        ...formData,
        giftText: transformJson,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl pb-20">
      {/* Header controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-40">
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
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-sm disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" /> {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo ưu đãi"}
          </button>
        </div>
      </div>

      {/* SECTION 1: LIVE HERO BANNER PREVIEW & PAN/ZOOM CANVAS */}
      <div className="bg-neutral-900 text-white rounded-2xl border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">

        {/* Title bar with live stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#F5B800]" /> Studio Xem Trước & Điều Chỉnh Ảnh Banner (Pan & Zoom)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Kéo chuột trực tiếp trên khung ảnh để di chuyển, hoặc dùng thanh trượt thu phóng và căn chỉnh tọa độ bên dưới.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-neutral-400">Vị trí:</span>
            <span className="text-[#F5B800] font-bold">X: {posX}% | Y: {posY}%</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">Thu phóng:</span>
            <span className="text-cyan-400 font-bold">{Math.round(zoomScale * 100)}%</span>
          </div>
        </div>

        {/* Live Interactive Hero Preview Frame */}
        <div
          ref={previewRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black cursor-grab active:cursor-grabbing select-none flex flex-col justify-between p-6 sm:p-10 group"
          title="Nhấn giữ và kéo chuột để di chuyển ảnh"
        >
          {/* Background image with real-time Pan & Zoom transform */}
          {formData.imageUrl ? (
            <img
              src={formData.imageUrl}
              alt="Hero Background Preview"
              style={{
                objectPosition: `${posX}% ${posY}%`,
                transform: `scale(${zoomScale})`,
                transformOrigin: `${posX}% ${posY}%`,
              }}
              className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-105 pointer-events-none transition-transform duration-75"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center text-sm text-neutral-500">
              Chưa có ảnh banner
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D0E]/95 via-[#0B0D0E]/70 to-transparent sm:w-3/4 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0E] via-transparent to-[#0B0D0E]/40 pointer-events-none" />

          {/* Live Focal Point Crosshair Indicator */}
          <div
            style={{ left: `${posX}%`, top: `${posY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-dashed border-[#F5B800] bg-[#F5B800]/20 pointer-events-none z-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
          </div>

          {/* Hint Overlay badge */}
          <div className="absolute top-3 right-3 z-30 opacity-80 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/20 text-[11px] px-3.5 py-1.5 rounded-full text-[#F5B800] pointer-events-none flex items-center gap-1.5 shadow-lg">
            <Move className="w-3.5 h-3.5" />
            <span>Kéo chuột để di chuyển • Lăn chuột hoặc chỉnh thanh trượt để phóng to</span>
          </div>

          {/* Real Live Text Content */}
          <div className="relative z-10 max-w-xl space-y-3.5 pointer-events-none my-auto">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 border border-[#F5B800]/80 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full text-[#F5B800] text-xs font-bold uppercase shadow-sm">
              <Leaf className="w-3 h-3 fill-[#F5B800]" />
              <span className="font-display tracking-widest">{formData.tag || "HÀNH TRÌNH XANH"}</span>
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-[0.92] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {formData.title ? (
                formData.title.split("\n").map((l, i) => (
                  <span key={i} className="block">{l}</span>
                ))
              ) : (
                "ĐỔI BALO CŨ NHẬN NGAY"
              )}
            </h1>

            {/* Highlight & Discount */}
            <div className="space-y-0.5 pt-0.5">
              {formData.highlight && (
                <div className="flex items-center gap-2.5 w-fit">
                  <div className="h-[2px] w-8 bg-[#F5B800]" />
                  <span className="font-display font-black text-xs tracking-[0.2em] text-white uppercase">
                    {formData.highlight}
                  </span>
                  <div className="h-[2px] w-8 bg-[#F5B800]" />
                </div>
              )}

              {formData.discountValue && (
                <div className="font-display font-black text-4xl sm:text-6xl text-[#F5B800] leading-none drop-shadow-[0_4px_20px_rgba(245,184,0,0.4)]">
                  {formData.discountValue}
                </div>
              )}
            </div>

            {/* Description */}
            {formData.description && (
              <p className="text-gray-300 text-xs sm:text-sm max-w-md leading-relaxed line-clamp-2 font-light">
                {formData.description}
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3.5 pt-1">
              <span className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-md">
                <span>{formData.ctaText || "THAM GIA NGAY"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-display font-bold uppercase tracking-widest text-white">
                XEM CHI TIẾT
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLLER TOOLBAR: ZOOM & MULTI-DIRECTIONAL PAN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-black/50 border border-white/10 p-5 rounded-2xl">

          {/* 1. Zoom / Scale Controller (4 cols) */}
          <div className="lg:col-span-5 space-y-3 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <ZoomIn className="w-4 h-4 text-cyan-400" /> Thu phóng kích thước ảnh (Zoom)
              </label>
              <span className="font-mono text-xs text-cyan-400 font-bold">{Math.round(zoomScale * 100)}%</span>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.8, Number((prev - 0.1).toFixed(2))))}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={zoomScale}
                onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 h-2 bg-neutral-700 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(2.5, Number((prev + 0.1).toFixed(2))))}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Zoom Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              {[1.0, 1.25, 1.5, 2.0].map((scale) => (
                <button
                  type="button"
                  key={scale}
                  onClick={() => setZoomScale(scale)}
                  className={`flex-1 py-1 px-2 rounded text-[11px] font-mono border transition-all ${zoomScale === scale
                      ? "bg-cyan-500 text-black font-bold border-cyan-400"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500"
                    }`}
                >
                  {Math.round(scale * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* 2. Multi-Directional Pan / Move Controller (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Move className="w-4 h-4 text-[#F5B800]" /> Căn dịch chuyển Trái / Phải & Lên / Xuống (Pan)
              </label>

              <button
                type="button"
                onClick={handleResetTransform}
                className="flex items-center gap-1 text-[11px] text-[#F5B800] hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại mặc định
              </button>
            </div>

            {/* Sliders for X & Y */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Trục ngang (Trái ↔ Phải):</span>
                  <span className="font-mono text-[#F5B800] font-bold">{posX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => setPosX(parseInt(e.target.value))}
                  className="w-full accent-[#F5B800] h-2 bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Trục dọc (Trên ↕ Dưới):</span>
                  <span className="font-mono text-[#F5B800] font-bold">{posY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => setPosY(parseInt(e.target.value))}
                  className="w-full accent-[#F5B800] h-2 bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* D-Pad Nudge Buttons + 9-point presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Nudge D-pad */}
              <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-lg border border-neutral-700">
                <button
                  type="button"
                  onClick={() => handleNudge(-5, 0)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white"
                  title="Sang Trái 5%"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(5, 0)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white"
                  title="Sang Phải 5%"
                >
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(0, -5)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white"
                  title="Lên Trên 5%"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(0, 5)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white"
                  title="Xuống Dưới 5%"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 9 Presets */}
              <div className="flex flex-wrap items-center gap-1">
                {positionPresets.map((p) => {
                  const isSelected = posX === p.x && posY === p.y;
                  return (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => {
                        setPosX(p.x);
                        setPosY(p.y);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${isSelected
                          ? "bg-[#F5B800] text-black border-[#F5B800] font-bold"
                          : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500"
                        }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 2: BANNER IMAGE INPUT */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-3">1. Ảnh Banner Chương Trình</h2>
        <ImageInputWithRemover
          label="Đường dẫn ảnh Background Banner (URL / Cloudinary / Tách Nền AI)"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={(newUrl) => setFormData((prev) => ({ ...prev, imageUrl: newUrl }))}
          placeholder="https://images.unsplash.com/... hoặc /hero-banner.png"
          required
          helpText="Khuyên dùng ảnh chất lượng cao 1920x1080px (người mẫu hoặc balo nằm lệch sang phải)."
        />
      </div>

      {/* SECTION 3: EDITORIAL CONTENT & DISCOUNT */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-3">2. Nội dung & Mức Giảm Giá</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề chính trên Hero (Hỗ trợ xuống dòng) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="title"
              rows={2}
              value={formData.title}
              onChange={handleChange}
              placeholder="Ví dụ: ĐỔI BALO CŨ&#10;NHẬN NGAY"
              required
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">Gõ Enter để xuống dòng trên banner</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức giảm giá / Con số lớn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder="Ví dụ: 200.000Đ hoặc GIẢM 45%"
              required
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg font-black text-amber-600 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chữ gạch ngang highlight</label>
            <input
              type="text"
              name="highlight"
              value={formData.highlight}
              onChange={handleChange}
              placeholder="Ví dụ: TRỢ GIÁ hoặc GIẢM ĐẾN"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag chiến dịch (Viền vàng)</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              placeholder="Ví dụ: HÀNH TRÌNH XANH"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết chương trình</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Ví dụ: Đổi balo cũ bất kỳ nhận ngay voucher trợ giá 200.000đ..."
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
              placeholder="Ví dụ: THAM GIA NGAY"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link chuyển hướng khi click nút</label>
            <input
              type="text"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
              placeholder="/san-pham"
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
              placeholder="ECO200"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự ưu tiên hiển thị (Sort Order)</label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
            Kích hoạt chương trình ưu đãi này trên trang chủ ngay
          </label>
        </div>
      </div>
    </form>
  );
}
