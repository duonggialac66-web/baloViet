"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { useImageColor } from "@/lib/colorExtractor";

export interface PromoOffer {
  id: string;
  tag: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  code?: string | null;
  discountValue?: string | null;
  minOrder?: string | null;
  giftText?: string | null; // Used for transform: {"x":82,"y":50,"scale":1.2,"isProductPng":true,"themeColor":"#3a6988"}
  ctaText?: string | null;
  targetUrl?: string | null;
  imageUrl: string;
  floatingPerks?: string[] | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

const defaultPromotions: PromoOffer[] = [
  {
    id: "promo-eco-tradein",
    tag: "HÀNH TRÌNH XANH",
    badge: "ĐỔI BALO CŨ NHẬN NGAY",
    title: "ĐỔI BALO CŨ\nNHẬN NGAY",
    highlight: "TRỢ GIÁ",
    discountValue: "200.000Đ",
    description: "Đổi balo cũ bất kỳ nhận ngay voucher trợ giá 200.000đ nâng cấp lên dòng Balo Việt chất liệu vải sợi tái chế 900D siêu bền bỉ.",
    code: "ECO200",
    ctaText: "THAM GIA NGAY",
    targetUrl: "/san-pham?tag=eco",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&h=1080&fit=crop&auto=format",
    giftText: '{"x":82,"y":50,"scale":1.0,"isProductPng":false,"themeColor":"#3a6988"}',
  },
  {
    id: "promo-flash-sale",
    tag: "FLASH SALE MÙA DU LỊCH",
    badge: "ĐẠI TIỆC ƯU ĐÃI",
    title: "ĐẠI TIỆC MÙA HÈ\nBALO VIỆT PRO",
    highlight: "GIẢM ĐẾN",
    discountValue: "45%",
    description: "Giảm tới 45% toàn bộ bộ sưu tập Balo Laptop & Du Lịch chống nước IPX6. Tặng kèm Áo Mưa Balo chuyên dụng trị giá 150.000đ cho đơn từ 990K.",
    code: "FLASHSALE45",
    ctaText: "SĂN DEAL NGAY",
    targetUrl: "/san-pham",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=1920&h=1080&fit=crop&auto=format",
    giftText: '{"x":50,"y":50,"scale":1.0,"isProductPng":false,"themeColor":"#3a6988"}',
  },
  {
    id: "promo-welcome-member",
    tag: "ĐẶC QUYỀN THÀNH VIÊN",
    badge: "QUÀ TẶNG BẠN MỚI",
    title: "ĐĂNG KÝ THÀNH VIÊN\nNHẬN QUÀ NGAY",
    highlight: "GIẢM NGAY",
    discountValue: "15% + FREESHIP",
    description: "Đăng ký thành viên nhận ngay voucher giảm 15% trực tiếp cho đơn hàng đầu tiên. Miễn phí giao hàng hỏa tốc 2H toàn quốc.",
    code: "WELCOME15",
    ctaText: "NHẬN MÃ 15% NGAY",
    targetUrl: "/dang-ky",
    imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1920&h=1080&fit=crop&auto=format",
    giftText: '{"x":50,"y":50,"scale":1.0,"isProductPng":false,"themeColor":"#3a6988"}',
  },
];

const AUTO_ROTATE_INTERVAL = 7000;

interface HeroSectionProps {
  initialPromotions?: PromoOffer[];
}

export default function HeroSection({ initialPromotions = [] }: HeroSectionProps) {
  const promotionsList = initialPromotions.length > 0 ? initialPromotions : defaultPromotions;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto rotate active promotion
  useEffect(() => {
    if (isPaused || promotionsList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % promotionsList.length);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearTimeout(timer);
  }, [isPaused, promotionsList.length]);

  const currentPromo = promotionsList[activeIndex] || promotionsList[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : promotionsList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < promotionsList.length - 1 ? prev + 1 : 0));
  };

  // Parse transform configuration (position X/Y, scale/zoom, isProductPng, themeColor)
  const imageTransform = (() => {
    const raw = currentPromo.giftText;
    let posX = 82;
    let posY = 50;
    let scale = 1.0;
    let isProductPng = false;
    let themeColor = "#3a6988";

    if (raw) {
      try {
        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          if (parsed.x !== undefined) posX = Number(parsed.x);
          if (parsed.y !== undefined) posY = Number(parsed.y);
          if (parsed.scale !== undefined) scale = Number(parsed.scale) || 1;
          if (parsed.isProductPng !== undefined) isProductPng = Boolean(parsed.isProductPng);
          if (parsed.themeColor) themeColor = parsed.themeColor;
        } else if (raw.includes("left")) {
          posX = 18; posY = 50;
        } else if (raw.includes("center")) {
          posX = 50; posY = 50;
        } else if (raw.includes("right")) {
          posX = 82; posY = 50;
        }
      } catch (e) {
        // fallback
      }
    }

    return { posX, posY, scale, isProductPng, themeColor };
  })();

  // Dynamically extract edge color of photo (or use themeColor if provided)
  const colorInfo = useImageColor(currentPromo.imageUrl, imageTransform.themeColor);

  return (
    <section 
      className="relative h-screen min-h-[540px] max-h-[740px] pt-16 sm:pt-20 lg:pt-20 pb-0 flex flex-col justify-between overflow-hidden select-none group/hero transition-colors duration-700"
      style={{
        backgroundColor: colorInfo.bgColor,
        color: colorInfo.textColor,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) handleNext();
        else if (diff < -50) handlePrev();
        touchStartX.current = null;
      }}
      aria-label="Hero Promotion Banner"
    >
      {/* === 1. CINEMATIC HERO BACKGROUND / PRODUCT IMAGE WITH SEAMLESS BLEND === */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Dynamic Ambient Background Glow sampling image/theme color */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: colorInfo.isLight
              ? `radial-gradient(circle at ${imageTransform.posX}% ${imageTransform.posY}%, ${colorInfo.bgColor} 0%, rgba(255,255,255,0.7) 60%, ${colorInfo.bgColor} 100%)`
              : `radial-gradient(circle at ${imageTransform.posX}% ${imageTransform.posY}%, ${colorInfo.bgColor}77 0%, ${colorInfo.bgColor}22 50%, #0B0D0E 90%)`,
          }}
        />

        {currentPromo.imageUrl ? (
          imageTransform.isProductPng ? (
            /* Floating Product PNG Mode (Direct position X/Y + scale) */
            <div
              className="absolute z-10"
              style={{
                left: `${imageTransform.posX}%`,
                top: `${imageTransform.posY}%`,
                transform: "translate(-50%, -50%)",
                width: "min(420px, 42vw)",
                height: "min(460px, 54vh)",
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ transform: `scale(${imageTransform.scale})` }}
              >
                <img
                  key={`hero-bg-${currentPromo.id}`}
                  src={currentPromo.imageUrl}
                  alt={currentPromo.title}
                  className="w-full h-full object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] hero-fade-in"
                />
              </div>
            </div>
          ) : (
            /* Full Cover Photo Mode with Seamless Soft Edge Gradient Mask */
            <div
              className="w-full h-full overflow-hidden"
              style={{
                transform: `scale(${imageTransform.scale})`,
                transformOrigin: `${imageTransform.posX}% ${imageTransform.posY}%`,
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, black 40%, black 100%)",
                maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, black 40%, black 100%)",
              }}
            >
              <img
                key={`hero-bg-${currentPromo.id}`}
                src={currentPromo.imageUrl}
                alt={currentPromo.title}
                style={{
                  objectPosition: `${imageTransform.posX}% ${imageTransform.posY}%`,
                }}
                className="w-full h-full object-cover hero-fade-in filter brightness-[0.96] contrast-[1.03] transition-all duration-700"
              />
            </div>
          )
        ) : null}

        {/* Smooth Seamless Color Gradients matching extracted image edge color */}
        <div
          className="absolute inset-0 w-full pointer-events-none transition-all duration-700"
          style={{
            background: colorInfo.isLight
              ? `linear-gradient(to right, ${colorInfo.bgColor} 0%, ${colorInfo.bgColor}E6 40%, transparent 100%)`
              : `linear-gradient(to right, ${colorInfo.bgColor} 0%, ${colorInfo.bgColor}CC 45%, transparent 100%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: colorInfo.isLight
              ? `linear-gradient(to top, ${colorInfo.bgColor} 0%, transparent 40%, ${colorInfo.bgColor}44 100%)`
              : `linear-gradient(to top, ${colorInfo.bgColor} 0%, transparent 40%, ${colorInfo.bgColor}66 100%)`,
          }}
        />
      </div>

      {/* === 2. MAIN PROMOTION TYPOGRAPHY & SHOWCASE === */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 lg:px-12 my-auto py-3 sm:py-6">
        <div className="max-w-2xl space-y-3 sm:space-y-4 hero-slide-up" key={`hero-info-${currentPromo.id}`}>
          
          {/* Tag Badge */}
          <div
            className="inline-flex items-center gap-2 border border-[#F5B800]/80 backdrop-blur-md px-3.5 py-1 rounded-full text-[#F5B800] shadow-md"
            style={{ backgroundColor: colorInfo.badgeBg }}
          >
            <Leaf className="w-3.5 h-3.5 fill-[#F5B800]" />
            <span className="font-display font-bold text-xs uppercase tracking-widest text-[#F5B800]">
              {currentPromo.tag || "HÀNH TRÌNH XANH"}
            </span>
          </div>

          {/* Giant Bold Title with Adaptive Text Color */}
          <h1
            style={{ color: colorInfo.textColor }}
            className={`font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] uppercase tracking-tight leading-[0.95] ${
              colorInfo.isLight ? "drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]" : "drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
            }`}
          >
            {currentPromo.title ? (
              currentPromo.title.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))
            ) : (
              <>
                <span className="block">ĐỔI BALO CŨ</span>
                <span className="block">NHẬN NGAY</span>
              </>
            )}
          </h1>

          {/* Highlight & Huge Yellow Discount Block */}
          <div className="space-y-0.5 pt-0.5">
            {currentPromo.highlight && (
              <div className="flex items-center gap-3 w-fit">
                <div className="h-[2px] w-8 sm:w-12 bg-[#F5B800]" />
                <span
                  style={{ color: colorInfo.textColor }}
                  className="font-display font-black text-xs sm:text-sm tracking-[0.25em] uppercase drop-shadow"
                >
                  {currentPromo.highlight}
                </span>
                <div className="h-[2px] w-8 sm:w-12 bg-[#F5B800]" />
              </div>
            )}

            {currentPromo.discountValue && (
              <div className="font-display font-black text-4xl sm:text-6xl lg:text-[4.75rem] tracking-tight text-[#F5B800] leading-none drop-shadow-[0_4px_30px_rgba(245,184,0,0.45)]">
                {currentPromo.discountValue}
              </div>
            )}
          </div>

          {/* Campaign Description */}
          {currentPromo.description && (
            <p
              style={{ color: colorInfo.subtextColor }}
              className="text-xs sm:text-sm max-w-lg leading-relaxed font-normal"
            >
              {currentPromo.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1">
            <Link
              href={currentPromo.targetUrl || "/san-pham"}
              className="px-6 py-3 bg-[#F5B800] hover:bg-[#E5AB00] text-[#0B0D0E] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(245,184,0,0.3)] hover:shadow-[0_0_35px_rgba(245,184,0,0.5)] active:scale-95 flex items-center gap-2"
            >
              <span>{currentPromo.ctaText || "THAM GIA NGAY"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {currentPromo.code && (
              <div
                className="flex items-center gap-2 border border-[#F5B800]/50 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-xs font-mono"
                style={{
                  backgroundColor: colorInfo.isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.7)",
                  color: colorInfo.textColor,
                }}
              >
                <span style={{ color: colorInfo.subtextColor }}>Mã:</span>
                <span className="text-[#F5B800] font-bold tracking-widest">{currentPromo.code}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* === 3. CAROUSEL NAVIGATION & INDICATORS BAR === */}
      <div
        className="relative z-10 border-t backdrop-blur-md py-4 px-6 lg:px-12 flex items-center justify-between transition-colors duration-700"
        style={{
          borderColor: colorInfo.isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
          backgroundColor: colorInfo.isLight ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          {promotionsList.map((promo, idx) => (
            <button
              key={promo.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? "w-8 bg-[#F5B800] shadow-[0_0_10px_rgba(245,184,0,0.6)]"
                  : colorInfo.isLight ? "w-2 bg-black/30 hover:bg-black/60" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              title={promo.tag}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full border transition-colors cursor-pointer flex items-center justify-center"
            style={{
              borderColor: colorInfo.isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
              color: colorInfo.textColor,
            }}
            title="Ưu đãi trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full border transition-colors cursor-pointer flex items-center justify-center"
            style={{
              borderColor: colorInfo.isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
              color: colorInfo.textColor,
            }}
            title="Ưu đãi tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

