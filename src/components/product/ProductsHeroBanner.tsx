"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import type { Product } from "@/data/products";
import type { CategoryDisplaySettings } from "@/lib/schema";
import { useImageColor } from "@/lib/colorExtractor";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  imageId: string | null;
  description: string | null;
  displaySettings?: CategoryDisplaySettings | null;
  count?: number;
}

interface ProductsHeroBannerProps {
  categories: CategoryData[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  featuredProduct?: Product;
  totalProductsCount?: number;
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "balo-laptop": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&auto=format&q=80",
  "balo-du-lich": "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop&auto=format&q=80",
  "balo-chong-nuoc": "https://images.unsplash.com/photo-1622260614927-208cfe3f5cfd?w=600&h=600&fit=crop&auto=format&q=80",
  "balo-thoi-trang": "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&h=600&fit=crop&auto=format&q=80",
  "balo-hoc-sinh": "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600&h=600&fit=crop&auto=format&q=80",
};

const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&auto=format&q=80";

/* Default annotations when admin has not configured */
const DEFAULT_ANNOTATIONS: CategoryDisplaySettings["annotations"] = [
  { label: "Chống nước IPX6", dotX: 60, dotY: 28, labelX: 86, labelY: 20, side: "right" },
  { label: "Đệm lưng thoáng khí", dotX: 62, dotY: 48, labelX: 88, labelY: 48, side: "right" },
  { label: "Chất liệu cao cấp", dotX: 58, dotY: 66, labelX: 84, labelY: 72, side: "right" },
  { label: "Ngăn laptop 15.6\"", dotX: 40, dotY: 32, labelX: 12, labelY: 24, side: "left" },
  { label: "Bảo hành 24 tháng", dotX: 38, dotY: 58, labelX: 10, labelY: 58, side: "left" },
];

const DEFAULT_DISPLAY: CategoryDisplaySettings = {
  imageX: 0,
  imageY: -5,
  imageScale: 100,
  annotations: DEFAULT_ANNOTATIONS,
};

export default function ProductsHeroBanner({
  categories,
  activeCategory,
  onCategoryChange,
  featuredProduct,
}: ProductsHeroBannerProps) {
  const [isEntering, setIsEntering] = useState(true);
  const prevCategoryRef = useRef(activeCategory);

  const currentCategory = useMemo(() => {
    if (activeCategory === "all") {
      return categories.find((c) => c.imageId || c.displaySettings) || categories[0] || null;
    }
    return categories.find((c) => c.slug === activeCategory) || null;
  }, [categories, activeCategory]);

  /* Get display settings: admin-configured or default */
  const displaySettings = useMemo<CategoryDisplaySettings>(() => {
    const s = currentCategory?.displaySettings;
    if (s && typeof s.imageX === "number") {
      return {
        imageX: s.imageX ?? 0,
        imageY: s.imageY ?? -5,
        imageScale: s.imageScale ?? 100,
        annotations: s.annotations?.length ? s.annotations : DEFAULT_ANNOTATIONS,
      };
    }
    return DEFAULT_DISPLAY;
  }, [currentCategory]);

  const displayImage = useMemo(() => {
    if (currentCategory) {
      if (currentCategory.imageId) {
        if (currentCategory.imageId.startsWith("data:")) return currentCategory.imageId;
        if (currentCategory.imageId.startsWith("http")) return currentCategory.imageId;
        return buildCloudinaryUrl(currentCategory.imageId, { width: 900, height: 900, quality: "auto" });
      }
      if (CATEGORY_FALLBACK_IMAGES[currentCategory.slug]) {
        return CATEGORY_FALLBACK_IMAGES[currentCategory.slug];
      }
    }
    return featuredProduct?.images?.[0]?.url || DEFAULT_BANNER_IMAGE;
  }, [currentCategory, featuredProduct]);

  const categoryIndex = useMemo(() => {
    if (activeCategory === "all") return -1;
    return categories.findIndex((c) => c.slug === activeCategory);
  }, [categories, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (prevCategoryRef.current !== activeCategory) {
      prevCategoryRef.current = activeCategory;
    }
  }, [activeCategory]);

  const handlePrevCategory = () => {
    if (categories.length === 0) return;
    if (categoryIndex <= 0) onCategoryChange(categories[categories.length - 1].slug);
    else onCategoryChange(categories[categoryIndex - 1].slug);
  };
  const handleNextCategory = () => {
    if (categories.length === 0) return;
    if (categoryIndex < 0 || categoryIndex >= categories.length - 1) onCategoryChange(categories[0].slug);
    else onCategoryChange(categories[categoryIndex + 1].slug);
  };

  const handleScrollToGrid = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("brows-latest-products")?.scrollIntoView({ behavior: "smooth" });
  };
  const handleScrollToDeals = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("hot-deals")?.scrollIntoView({ behavior: "smooth" });
  };

  const colorInfo = useImageColor(displayImage, displaySettings.themeColor);

  return (
    <section
      className="relative pt-16 pb-14 lg:pt-20 lg:pb-16 overflow-hidden select-none border-b transition-colors duration-700"
      style={{
        backgroundColor: colorInfo.bgColor,
        color: colorInfo.textColor,
        borderColor: colorInfo.isLight ? "rgba(0, 0, 0, 0.08)" : "#18191C",
      }}
    >
      {/* Ambient glows adaptive to image tone */}
      <div
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: colorInfo.isLight ? "rgba(245, 184, 0, 0.15)" : "rgba(245, 184, 0, 0.06)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: colorInfo.isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(245, 184, 0, 0.04)",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Category Filter Chips */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 mt-[5px] pt-[5px] scrollbar-hide transition-all duration-700"
          style={{
            opacity: isEntering ? 0 : 1,
            transform: isEntering ? "translateY(-15px)" : "translateY(5px)",
          }}
        >
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 shrink-0 font-sans ${
              activeCategory === "all"
                ? "bg-[#F5B800] text-[#0B0D0E] shadow-[0_0_15px_rgba(245,184,0,0.4)] border border-[#F5B800] font-bold"
                : colorInfo.isLight
                ? "bg-white/80 text-gray-800 border border-gray-300 hover:border-[#F5B800]"
                : "bg-[#121316] text-gray-400 border border-[#222428] hover:border-[#F5B800]/50 hover:text-white"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 shrink-0 font-sans ${
                  isActive
                    ? "bg-[#F5B800] text-[#0B0D0E] shadow-[0_0_15px_rgba(245,184,0,0.4)] border border-[#F5B800] font-bold"
                    : colorInfo.isLight
                    ? "bg-white/80 text-gray-800 border border-gray-300 hover:border-[#F5B800]"
                    : "bg-[#121316] text-gray-400 border border-[#222428] hover:border-[#F5B800]/50 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ======= MAIN HERO: 2 Columns ======= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">

          {/* LEFT COLUMN: Text Content */}
          <div
            className="lg:col-span-5 space-y-6 transition-all duration-700 ease-out"
            style={{
              opacity: isEntering ? 0 : 1,
              transform: isEntering ? "translateX(-50px)" : "translateX(0)",
            }}
          >
            <h1
              style={{ color: colorInfo.textColor }}
              className="font-syne text-3xl sm:text-4xl lg:text-[44px] tracking-tight leading-[1.15] font-bold"
            >
              Khám phá{" "}
              <span className="inline-flex items-center px-4 py-1 rounded-full border border-[#F5B800] text-xs font-semibold text-[#F5B800] align-middle mx-1 bg-[#F5B800]/10 shadow-[0_0_15px_rgba(245,184,0,0.2)] font-sans">
                {currentCategory ? currentCategory.name : "Balo Việt"}
              </span>
              <br />
              cùng chúng tôi
            </h1>

            <p
              style={{ color: colorInfo.subtextColor }}
              className="text-sm leading-relaxed max-w-md font-sans"
            >
              {currentCategory?.description ||
                "Balo Việt – thương hiệu balo chính hãng Việt Nam. Thiết kế tinh tế, chất liệu cao cấp, bền bỉ cho mọi hành trình."}
            </p>

            <div className="flex items-center gap-4 pt-1">
              <button type="button" onClick={handleScrollToGrid}
                className="px-6 py-3 rounded-lg bg-[#F5B800] hover:bg-[#E5AB00] text-[#0B0D0E] text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(245,184,0,0.25)] hover:shadow-[0_0_30px_rgba(245,184,0,0.45)] active:scale-95 font-sans">
                Xem sản phẩm
              </button>
              <button type="button" onClick={handleScrollToDeals}
                style={{
                  backgroundColor: colorInfo.isLight ? "rgba(255,255,255,0.85)" : "#121316",
                  color: colorInfo.textColor,
                  borderColor: colorInfo.isLight ? "rgba(0,0,0,0.15)" : "rgba(245,184,0,0.5)",
                }}
                className="px-6 py-3 rounded-lg border hover:border-[#F5B800] text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2 active:scale-95 group font-sans">
                <span className="w-5 h-5 rounded-full border border-[#F5B800] flex items-center justify-center text-[#F5B800] text-[9px] group-hover:bg-[#F5B800] group-hover:text-[#0B0D0E] transition-colors">▶</span>
                <span>Hot Deals</span>
              </button>
            </div>

            {/* Stats Capsule */}
            <div className="pt-2 max-w-md">
              <div
                className="rounded-full border backdrop-blur-md px-6 sm:px-8 py-4 flex items-center justify-between transition-colors duration-700"
                style={{
                  backgroundColor: colorInfo.isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(18, 19, 22, 0.7)",
                  borderColor: colorInfo.isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(245, 184, 0, 0.25)",
                }}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-1">
                    <span style={{ color: colorInfo.textColor }} className="font-bold text-sm font-sans">Thoải mái</span>
                    <span className="text-[#F5B800] text-xs">↗</span>
                  </div>
                  <p style={{ color: colorInfo.subtextColor }} className="text-[11px] leading-snug mt-1 font-sans">Đệm lưng ergonomic, thoáng khí.</p>
                </div>
                <div className="w-px h-10 bg-[#F5B800]/20 shrink-0" />
                <div className="flex-1 pl-4 sm:pl-6">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#F5B800] text-sm font-sans">Phong cách</span>
                    <span className="text-[#F5B800] text-xs">↗</span>
                  </div>
                  <p style={{ color: colorInfo.subtextColor }} className="text-[11px] leading-snug mt-1 font-sans">Hàng trăm mẫu mã đa dạng.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: SHOWCASE — Ring fixed center, image admin-positioned */}
          {/* ======================================================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[340px] sm:min-h-[420px] lg:min-h-[480px]">

            {/* ─── THE RING (Fixed Center, perspective oval) ─── */}
            <div
              className="absolute pointer-events-none select-none transition-all duration-700 ease-out"
              style={{
                left: "50%",
                bottom: "45px",
                width: "min(380px, 75vw)",
                height: "110px",
                transform: `translateX(-50%) ${isEntering ? "scale(0.7)" : "scale(1)"}`,
                opacity: isEntering ? 0 : 1,
              }}
            >
              <div className="absolute inset-0 bg-[#F5B800]/20 blur-[45px] rounded-[50%] animate-ring-glow" />
              <div className="absolute top-3 w-[98%] left-[1%] h-[90%] rounded-[50%] bg-[#0A0B0D] border-b-[8px] border-b-[#8B6A00]" />
              <div className="relative w-full h-full rounded-[50%] bg-[#0E0F11] border-[3px] border-[#F5B800] shadow-[0_0_40px_rgba(245,184,0,0.45),0_0_80px_rgba(245,184,0,0.15),inset_0_0_25px_rgba(245,184,0,0.2)] flex items-center justify-center">
                <div className="w-[88%] h-[80%] rounded-[50%] bg-[#141517] border border-[#2A2B30] shadow-inner" />
              </div>
            </div>

            {/* ─── PRODUCT IMAGE — 3 Wrappers: 1. Position Center, 2. Scale factor, 3. Drop Entrance animation ─── */}
            <div
              key={activeCategory}
              className="absolute z-20 pointer-events-none"
              style={{
                left: `calc(50% + ${displaySettings.imageX}%)`,
                top: `calc(45% + ${displaySettings.imageY}%)`,
                transform: "translate(-50%, -50%)",
                width: "min(300px, 75vw)",
                height: "min(360px, 80vw)",
              }}
            >
              {/* Middle wrapper: applies admin's scale factor safely without animation override */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${displaySettings.imageScale / 100})`,
                }}
              >
                {/* Inner wrapper: applies entrance animation */}
                <div className="w-full h-full hero-product-entrance flex items-center justify-center">
                  <img
                    src={displayImage}
                    alt={currentCategory?.name || "Balo Việt"}
                    width={500}
                    height={500}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)] animate-hero-float"
                  />
                </div>
              </div>
            </div>

            {/* ─── ANNOTATION LINES (PCB Circuit Trace 45° Elbow Lines matching reference image) ─── */}
            <div
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{ zIndex: 30 }}
            >
              {displaySettings.annotations.map((ann, i) => {
                const isRight = ann.side === "right";
                const indexStr = String(i + 1).padStart(2, "0");

                // Calculate PCB 45-degree circuit trace elbow points:
                // Ensure a distinct vertical delta for a visible 45-degree bend:
                let targetY = ann.labelY;
                const rawDy = targetY - ann.dotY;
                if (Math.abs(rawDy) < 4) {
                  targetY = ann.dotY + (i % 2 === 0 ? -6 : 6);
                }

                const dx = ann.labelX - ann.dotX;
                const dy = targetY - ann.dotY;
                const absDy = Math.abs(dy);

                // Step 1: Extend horizontally out from product dotX by ~4%
                const step1X = ann.dotX + (isRight ? Math.min(4, Math.abs(dx) * 0.25) : -Math.min(4, Math.abs(dx) * 0.25));
                const step1Y = ann.dotY;

                // Step 2: Diagonal 45-degree bend to reach targetY height
                const step2X = step1X + (isRight ? absDy : -absDy);
                const step2Y = targetY;

                // Full PCB Trace SVG Path:
                const pcbPathD = `M ${ann.dotX} ${ann.dotY} L ${step1X} ${step1Y} L ${step2X} ${step2Y} L ${ann.labelX} ${targetY}`;

                return (
                  <div
                    key={`${activeCategory}-ann-${i}`}
                    className="absolute inset-0 hero-annotation-entrance"
                    style={{ animationDelay: `${0.4 + i * 0.12}s` }}
                  >
                    {/* SVG Canvas for PCB Circuit Trace Leader Lines */}
                    <svg
                      className="absolute inset-0 w-full h-full overflow-visible"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      {/* PCB Terminal Pin Node Dot on Bag */}
                      <circle
                        cx={ann.dotX}
                        cy={ann.dotY}
                        r="0.75"
                        fill="#F5B800"
                      />

                      {/* Base Crisp Solid Gold PCB Trace */}
                      <path
                        d={pcbPathD}
                        stroke="#F5B800"
                        strokeWidth="0.4"
                        strokeOpacity="0.4"
                        fill="none"
                      />

                      {/* Flowing Energy Dashed Line along the PCB Trace */}
                      <path
                        d={pcbPathD}
                        stroke="#F5B800"
                        strokeWidth="0.55"
                        strokeDasharray="1.5 1"
                        className="animate-hud-dash"
                        strokeOpacity="0.95"
                        fill="none"
                      />

                      {/* PCB Elbow Joint Node (small tech accent) */}
                      <circle
                        cx={step2X}
                        cy={step2Y}
                        r="0.4"
                        fill="#F5B800"
                        opacity="0.8"
                      />

                      {/* PCB Terminal Pin Node Dot at Label Card */}
                      <circle
                        cx={ann.labelX}
                        cy={targetY}
                        r="0.75"
                        fill="#F5B800"
                      />
                    </svg>

                    {/* Specification Text Tag Card */}
                    <div
                      className="absolute group pointer-events-auto transition-all duration-300 hover:scale-105"
                      style={{
                        left: `${ann.labelX}%`,
                        top: `${targetY}%`,
                        transform: isRight
                          ? "translate(8px, -50%)"
                          : "translate(-100%, -50%) translateX(-8px)",
                      }}
                    >
                      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0D0E]/90 backdrop-blur-md border border-[#F5B800]/60 shadow-[0_0_15px_rgba(245,184,0,0.3)] animate-hud-card transition-all duration-300">
                        {/* Tech Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#F5B800]" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#F5B800]" />

                        {/* Tech Index Badge */}
                        <div className="px-1.5 py-0.5 rounded bg-[#F5B800]/15 border border-[#F5B800]/40 text-[#F5B800] text-[9px] font-mono font-bold tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] animate-pulse" />
                          <span>SYS.{indexStr}</span>
                        </div>

                        {/* Specification Label */}
                        <span className="text-white text-xs font-semibold tracking-wide font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
                          {ann.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Rotating Badge (top right) ─── */}
            <div
              className="absolute top-2 right-2 sm:right-6 z-20 transition-all duration-700"
              style={{
                opacity: isEntering ? 0 : 1,
                transform: isEntering ? "scale(0.5) rotate(-90deg)" : "scale(1) rotate(0)",
              }}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <svg className="w-full h-full animate-spin-slow text-gray-500" viewBox="0 0 100 100">
                  <path id="heroCirclePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                  <text fill="currentColor" style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "0.15em" }}>
                    <textPath href="#heroCirclePath" startOffset="0%">• CHÍNH HÃNG • BALO VIỆT •</textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#F5B800] text-xs font-bold font-sans">
                  ★
                </div>
              </div>
            </div>

            {/* ─── Slider Controls & Dot Indicators (bottom center) ─── */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-[#121316]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#222428]">
              <button
                type="button"
                onClick={handlePrevCategory}
                className="w-8 h-8 rounded-full border border-[#33363F] hover:border-[#F5B800] hover:text-[#F5B800] flex items-center justify-center text-xs text-gray-300 transition-colors cursor-pointer"
                title="Danh mục trước"
              >
                ←
              </button>

              {/* Dots for categories */}
              <div className="flex items-center gap-1.5 px-1">
                {categories.map((cat, idx) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onCategoryChange(cat.slug)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "w-6 bg-[#F5B800] shadow-[0_0_8px_rgba(245,184,0,0.6)]"
                          : "w-2 bg-gray-600 hover:bg-gray-400"
                      }`}
                      title={cat.name}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextCategory}
                className="w-8 h-8 rounded-full border border-[#33363F] hover:border-[#F5B800] hover:text-[#F5B800] flex items-center justify-center text-xs text-gray-300 transition-colors cursor-pointer"
                title="Danh mục tiếp theo"
              >
                →
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
