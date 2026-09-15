"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/store/cartContext";
import {
  ArrowLeft, Save, Leaf, ArrowRight, Move, Eye,
  ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown,
  ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon,
  Sliders, Maximize2, Layers, Target, Palette
} from "lucide-react";
import ImageInputWithRemover from "@/components/admin/ImageInputWithRemover";
import { useImageColor } from "@/lib/colorExtractor";

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
    giftText?: string | null; // Stores JSON: {"x":82,"y":50,"scale":1.0,"isProductPng":false,"themeColor":"#3a6988"}
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

const colorPresets = [
  { label: "✨ Tự Động (Auto)", hex: "auto" },
  { label: "Xanh Trời (Sky Blue)", hex: "#3a6988" },
  { label: "Trắng Sáng (Light)", hex: "#F5F5F7" },
  { label: "Vàng Gold", hex: "#8B6A00" },
  { label: "Đỏ Đô (Burgundy)", hex: "#7A1C1C" },
  { label: "Xanh Lá (Eco Green)", hex: "#1F5E3B" },
  { label: "Tối Giản (Navy/Black)", hex: "#18191C" },
];

const positionPresets = [
  { label: "Phải Giữa (Chuẩn)", x: 82, y: 50 },
  { label: "Chính Giữa", x: 50, y: 50 },
  { label: "Trái Giữa", x: 18, y: 50 },
  { label: "Phải Trên", x: 82, y: 25 },
  { label: "Phải Dưới", x: 82, y: 75 },
];

export default function PromotionForm({ initialData, isEdit = false }: PromotionFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Parse initial transform if present in giftText
  const parseInitialTransform = () => {
    const raw = initialData?.giftText;
    if (!raw) return { x: 82, y: 50, scale: 1.0, mobileX: 50, mobileY: 50, mobileScale: 1.0, isProductPng: false, themeColor: "auto" };
    try {
      if (raw.startsWith("{")) {
        const p = JSON.parse(raw);
        return {
          x: p.x !== undefined ? Number(p.x) : 82,
          y: p.y !== undefined ? Number(p.y) : 50,
          scale: p.scale !== undefined ? Number(p.scale) : 1.0,
          mobileX: p.mobileX !== undefined ? Number(p.mobileX) : 50,
          mobileY: p.mobileY !== undefined ? Number(p.mobileY) : 50,
          mobileScale: p.mobileScale !== undefined ? Number(p.mobileScale) : 1.0,
          isProductPng: Boolean(p.isProductPng),
          themeColor: p.themeColor || "auto",
        };
      }
      if (raw.includes("left")) return { x: 18, y: 50, scale: 1.0, mobileX: 50, mobileY: 50, mobileScale: 1.0, isProductPng: false, themeColor: "auto" };
      if (raw.includes("right")) return { x: 82, y: 50, scale: 1.0, mobileX: 50, mobileY: 50, mobileScale: 1.0, isProductPng: false, themeColor: "auto" };
      if (raw.includes("center")) return { x: 50, y: 50, scale: 1.0, mobileX: 50, mobileY: 50, mobileScale: 1.0, isProductPng: false, themeColor: "auto" };
    } catch (e) {
      // fallback
    }
    return { x: 82, y: 50, scale: 1.0, mobileX: 50, mobileY: 50, mobileScale: 1.0, isProductPng: false, themeColor: "auto" };
  };

  const initialTransform = parseInitialTransform();
  const [posX, setPosX] = useState(initialTransform.x);
  const [posY, setPosY] = useState(initialTransform.y);
  const [zoomScale, setZoomScale] = useState(initialTransform.scale);
  const [mobilePosX, setMobilePosX] = useState(initialTransform.mobileX);
  const [mobilePosY, setMobilePosY] = useState(initialTransform.mobileY);
  const [mobileZoomScale, setMobileZoomScale] = useState(initialTransform.mobileScale);
  const [isProductPng, setIsProductPng] = useState(initialTransform.isProductPng);
  const [themeColor, setThemeColor] = useState(initialTransform.themeColor);

  const currentX = previewMode === "mobile" ? mobilePosX : posX;
  const currentY = previewMode === "mobile" ? mobilePosY : posY;
  const currentScale = previewMode === "mobile" ? mobileZoomScale : zoomScale;

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
    if (previewMode === "mobile") {
      setMobilePosX(x);
      setMobilePosY(y);
    } else {
      setPosX(x);
      setPosY(y);
    }
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

  const handleResetTransform = () => {
    if (previewMode === "mobile") {
      setMobilePosX(50);
      setMobilePosY(50);
      setMobileZoomScale(1.0);
    } else {
      setPosX(82);
      setPosY(50);
      setZoomScale(1.0);
      setThemeColor("#3a6988");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      addToast("Vui lòng điền đủ Tiêu đề và Link ảnh", "error");
      return;
    }

    setLoading(true);
    try {
      // Encode transform config & theme color into giftText field
      const transformJson = JSON.stringify({
        x: posX,
        y: posY,
        scale: Number(zoomScale.toFixed(2)),
        mobileX: mobilePosX,
        mobileY: mobilePosY,
        mobileScale: Number(mobileZoomScale.toFixed(2)),
        isProductPng,
        themeColor,
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

  const colorInfo = useImageColor(formData.imageUrl, themeColor);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md sticky top-4 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/uu-dai"
            className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{isEdit ? "Chỉnh Sửa Ưu Đãi Hero Banner" : "Tạo Banner Ưu Đãi Mới"}</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Căn chỉnh vị trí balo & xem trước màu hòa trộn mép ảnh real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Đang lưu..." : isEdit ? "Cập Nhật Banner" : "Xuất Bản Banner"}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: FULL WIDESCREEN HERO PREVIEW STUDIO (COL-12)  */}
      {/* ======================================================== */}
      <div className="space-y-4">

        {/* Header Canvas Control Toolbar */}
        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-xl text-xs text-white">
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <Eye className="w-4 h-4" />
            <span>Studio Xem Trước & Căn Chỉnh Trọng Tâm Real-Time (Khung Rộng 100%)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/80 border border-white/10 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setIsProductPng(false)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${!isProductPng ? "bg-amber-600 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
              >
                🖼️ Ảnh Bìa
              </button>
              <button
                type="button"
                onClick={() => setIsProductPng(true)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${isProductPng ? "bg-amber-600 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
              >
                🎒 PNG
              </button>
            </div>

            <div className="flex items-center gap-1 bg-black/80 border border-white/10 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${previewMode === "desktop" ? "bg-neutral-600 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
              >
                💻 Web
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${previewMode === "mobile" ? "bg-neutral-600 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
              >
                📱 Mobile
              </button>
            </div>

            <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-neutral-400">X:{currentX}% Y:{currentY}%</span>
              <span className="text-cyan-400 font-bold">{Math.round(currentScale * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Live Widescreen Interactive Hero Preview Frame with Dynamic Edge Color Blend */}
        <div className="flex justify-center w-full">
          <div
            ref={previewRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl cursor-grab active:cursor-grabbing select-none flex flex-col justify-between group transition-all duration-500 ${previewMode === "desktop"
                ? "w-full h-[380px] sm:h-[460px] lg:h-[520px] p-6 sm:p-10 lg:p-12"
                : "w-[375px] h-[667px] p-6 max-w-full"
              }`}
            style={{
              backgroundColor: colorInfo.bgColor,
              color: colorInfo.textColor,
            }}
            title="Nhấn giữ và kéo chuột trực tiếp trên khung để di chuyển ảnh"
          >
            {/* Ambient Color Flow Glow Behind Image */}
            {previewMode === "desktop" ? (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: colorInfo.isLight
                    ? `radial-gradient(circle at ${currentX}% ${currentY}%, ${colorInfo.bgColor} 0%, rgba(255,255,255,0.7) 60%, ${colorInfo.bgColor} 100%)`
                    : `radial-gradient(circle at ${currentX}% ${currentY}%, ${colorInfo.bgColor}66 0%, ${colorInfo.bgColor}22 50%, #0B0D0E 90%)`,
                }}
              />
            ) : (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700"
                style={{ backgroundColor: colorInfo.bgColor }}
              />
            )}

            {/* Background image / Product PNG with real-time Pan & Zoom transform */}
            {formData.imageUrl ? (
              isProductPng ? (
                /* Product PNG Mode */
                <div
                  className="absolute z-10 pointer-events-none"
                  style={{
                    left: `${currentX}%`,
                    top: `${currentY}%`,
                    transform: "translate(-50%, -50%)",
                    width: previewMode === "desktop" ? "min(460px, 45vw)" : "280px",
                    height: previewMode === "desktop" ? "min(500px, 58vh)" : "320px",
                  }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ transform: `scale(${currentScale})` }}
                  >
                    <img
                      src={formData.imageUrl}
                      alt="Hero Product Preview"
                      className="w-full h-full object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              ) : (
                /* Full Cover Photo Mode with Seamless Soft Edge Gradient Mask */
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={
                    previewMode === "desktop" ? {
                      WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, black 40%, black 100%)",
                      maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, black 40%, black 100%)",
                    } : {}
                  }
                >
                  <img
                    src={formData.imageUrl}
                    alt="Hero Background Preview"
                    style={{
                      objectPosition: `${currentX}% ${currentY}%`,
                      transform: `scale(${currentScale})`,
                    }}
                    className={`w-full h-full object-cover transition-transform duration-75 filter ${previewMode === "desktop" ? "brightness-95 contrast-105" : "brightness-[0.4] contrast-105"}`}
                  />
                </div>
              )
            ) : (
              <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center text-sm text-neutral-500">
                Chưa có ảnh banner
              </div>
            )}

            {/* Smooth Edge Color Gradients for seamless text contrast */}
            {previewMode === "desktop" ? (
              <>
                <div
                  className="absolute inset-0 w-full pointer-events-none transition-all duration-500"
                  style={{
                    background: colorInfo.isLight
                      ? `linear-gradient(to right, ${colorInfo.bgColor} 0%, ${colorInfo.bgColor}E6 40%, transparent 100%)`
                      : `linear-gradient(to right, ${colorInfo.bgColor} 0%, ${colorInfo.bgColor}CC 45%, transparent 100%)`,
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500"
                  style={{
                    background: colorInfo.isLight
                      ? `linear-gradient(to top, ${colorInfo.bgColor} 0%, transparent 40%, ${colorInfo.bgColor}44 100%)`
                      : `linear-gradient(to top, ${colorInfo.bgColor} 0%, transparent 40%, ${colorInfo.bgColor}66 100%)`,
                  }}
                />
              </>
            ) : (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: colorInfo.isLight
                    ? `linear-gradient(to top, ${colorInfo.bgColor} 0%, rgba(255,255,255,0.7) 100%)`
                    : `linear-gradient(to top, ${colorInfo.bgColor} 0%, rgba(0,0,0,0.6) 100%)`
                }}
              />
            )}

            {/* Live Focal Point Crosshair Indicator */}
            <div
              style={{ left: `${currentX}%`, top: `${currentY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-dashed border-[#F5B800] bg-[#F5B800]/20 pointer-events-none z-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
            </div>

            {/* Hint Overlay badge */}
            <div className="absolute top-3 right-3 z-30 opacity-80 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/20 text-[11px] px-3.5 py-1.5 rounded-full text-[#F5B800] pointer-events-none flex items-center gap-1.5 shadow-lg">
              <Move className="w-3.5 h-3.5" />
              <span>Nhận diện hòa màu lề: {colorInfo.bgColor} ({colorInfo.isLight ? 'Tone sáng' : 'Tone tối'})</span>
            </div>

            {/* Real Live Text Content */}
            <div className="relative z-10 max-w-2xl space-y-4 pointer-events-none my-auto">
              {/* Tag */}
              <div
                className="inline-flex items-center gap-2 border border-[#F5B800]/80 backdrop-blur-md px-3.5 py-1 rounded-full text-[#F5B800] text-xs font-bold uppercase shadow-sm"
                style={{ backgroundColor: colorInfo.badgeBg }}
              >
                <Leaf className="w-3.5 h-3.5 fill-[#F5B800]" />
                <span className="font-display tracking-widest">{formData.tag || "HÀNH TRÌNH XANH"}</span>
              </div>

              {/* Title */}
              <h1
                style={{ color: colorInfo.textColor }}
                className={`font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[0.95] ${colorInfo.isLight ? "drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]" : "drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                  }`}
              >
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
                    <div className="h-[2px] w-10 bg-[#F5B800]" />
                    <span
                      style={{ color: colorInfo.textColor }}
                      className="font-display font-black text-xs sm:text-sm tracking-[0.2em] uppercase"
                    >
                      {formData.highlight}
                    </span>
                    <div className="h-[2px] w-10 bg-[#F5B800]" />
                  </div>
                )}

                {formData.discountValue && (
                  <div className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#F5B800] leading-none drop-shadow-[0_4px_20px_rgba(245,184,0,0.4)]">
                    {formData.discountValue}
                  </div>
                )}
              </div>

              {/* Description */}
              {formData.description && (
                <p
                  style={{ color: colorInfo.subtextColor }}
                  className="text-xs sm:text-sm max-w-lg leading-relaxed line-clamp-2 font-normal"
                >
                  {formData.description}
                </p>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-3.5 pt-1">
                <span className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-xl shadow-md">
                  <span>{formData.ctaText || "THAM GIA NGAY"}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
                <span
                  style={{ color: colorInfo.textColor }}
                  className="text-xs font-display font-bold uppercase tracking-widest"
                >
                  XEM CHI TIẾT
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* SECTION 2: 2 BALANCED SIDE-BY-SIDE CONTROL PANELS        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN (COL-6): STUDIO TRANSFORM & COLOR CONTROLLERS */}
        <div className="lg:col-span-6 space-y-6">

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-5 text-white shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sliders className="w-5 h-5 text-amber-500" /> Bảng Điều Khiển Hòa Màu & Căn Vị Trí
            </h3>

            {/* 1. Theme Color / Ambient Glow Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-500" /> Tông Màu Hòa Quyện (Theme Glow)
                </label>
                <input
                  type="color"
                  value={themeColor === "auto" ? colorInfo.bgColor : themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="text-black w-7 h-7 rounded cursor-pointer border border-neutral-600 bg-white border-gray-300"
                  title="Tự chọn màu Hex"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.hex}
                    onClick={() => setThemeColor(preset.hex)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${themeColor === preset.hex
                        ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20"
                        : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500"
                      }`}
                  >
                    {preset.hex !== "auto" && (
                      <span className="w-2.5 h-2.5 rounded-full border border-black/30" style={{ backgroundColor: preset.hex }} />
                    )}
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-800" />

            {/* 2. Zoom & Scale Controls */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <ZoomIn className="w-4 h-4 text-cyan-400" /> Thu phóng kích thước (Scale Zoom)
                </label>
                <span className="font-mono text-xs text-cyan-400 font-bold">{Math.round(currentScale * 100)}%</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => previewMode === "mobile" ? setMobileZoomScale((prev) => Math.max(0.6, Number((prev - 0.05).toFixed(2)))) : setZoomScale((prev) => Math.max(0.6, Number((prev - 0.05).toFixed(2))))}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0.6"
                  max="2.5"
                  step="0.05"
                  value={currentScale}
                  onChange={(e) => previewMode === "mobile" ? setMobileZoomScale(parseFloat(e.target.value)) : setZoomScale(parseFloat(e.target.value))}
                  className="text-black flex-1 accent-cyan-400 h-2 bg-neutral-700 rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => previewMode === "mobile" ? setMobileZoomScale((prev) => Math.min(2.5, Number((prev + 0.05).toFixed(2)))) : setZoomScale((prev) => Math.min(2.5, Number((prev + 0.05).toFixed(2))))}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-800" />

            {/* 3. Pan Position X & Y Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-[#F5B800]" /> Căn chỉnh tọa độ Pan (Ngang X / Dọc Y)
                </label>

                <button
                  type="button"
                  onClick={handleResetTransform}
                  className="flex items-center gap-1 text-xs text-[#F5B800] hover:text-white transition-colors cursor-pointer font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Mặc định
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 bg-black/40 border border-neutral-800 p-3 rounded-xl">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Tọa độ Ngang X:</span>
                    <span className="font-mono text-[#F5B800] font-bold">{currentX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentX}
                    onChange={(e) => previewMode === "mobile" ? setMobilePosX(parseInt(e.target.value)) : setPosX(parseInt(e.target.value))}
                    className="text-black w-full accent-[#F5B800] h-2 bg-neutral-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 bg-black/40 border border-neutral-800 p-3 rounded-xl">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Tọa độ Dọc Y:</span>
                    <span className="font-mono text-[#F5B800] font-bold">{currentY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentY}
                    onChange={(e) => previewMode === "mobile" ? setMobilePosY(parseInt(e.target.value)) : setPosY(parseInt(e.target.value))}
                    className="text-black w-full accent-[#F5B800] h-2 bg-neutral-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (COL-6): PROMOTION DETAILS INPUT FORM */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Thông tin Chi tiết Banner & Ưu đãi
          </h3>

          {/* Banner Image Link & AI Remover */}
          <ImageInputWithRemover
            label="Hình ảnh Banner Hero Trang Chủ"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            placeholder="Nhập URL ảnh banner, tải từ máy tính hoặc bấm Xóa phông AI..."
            helpText="Dán URL hoặc tải file ảnh lên. Kéo thả trực tiếp ở Studio trên để xem nhận diện màu mép ảnh."
          />

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Tiêu đề chính (Có thể xuống dòng) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="title"
                rows={2}
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: ĐỔI BALO CŨ&#10;NHẬN NGAY"
                className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Thẻ Tag nhỏ (Hàng trên cùng)
                </label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="VD: HÀNH TRÌNH XANH"
                  className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tiêu đề phụ (Highlight)
                </label>
                <input
                  type="text"
                  name="highlight"
                  value={formData.highlight}
                  onChange={handleChange}
                  placeholder="VD: TRỢ GIÁ HOẶC GIẢM ĐẾN"
                  className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Giá trị giảm giá siêu lớn (Vàng Gold)
              </label>
              <input
                type="text"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder="VD: 200.000Đ hoặc 45%"
                className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-amber-600 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Mô tả chiến dịch ưu đãi
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn thể lệ ưu đãi..."
                className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tên nút bấm (CTA)
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="VD: THAM GIA NGAY"
                  className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Mã giảm giá (Code)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="VD: ECO200"
                  className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Đường dẫn khi click nút
              </label>
              <input
                type="text"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleChange}
                placeholder="VD: /san-pham"
                className="text-black w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="text-black w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-800">Hiển thị ưu đãi này trên trang chủ</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
