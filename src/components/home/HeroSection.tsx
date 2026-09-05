"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf } from "lucide-react";

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
  giftText?: string | null; // Used for focal point / object-position (e.g. "center right", "80% 50%")
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
    giftText: "center right",
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
    giftText: "center center",
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
    giftText: "center center",
  },
  {
    id: "promo-combo-duo",
    tag: "COMBO TIẾT KIỆM",
    badge: "COMBO ĐÔI HÀNH TRÌNH",
    title: "MUA BALO ĐÔI\nTIẾT KIỆM CỰC ĐỈNH",
    highlight: "TIẾT KIỆM ĐẾN",
    discountValue: "500.000Đ",
    description: "Mua 1 Balo Laptop Công Sở + 1 Balo Du Lịch bất kỳ, giảm trực tiếp 500.000đ. Tặng kèm Túi Đeo Chéo EDC chống nước cao cấp trị giá 250K.",
    code: "COMBODUO",
    ctaText: "CHỌN COMBO NGAY",
    targetUrl: "/san-pham",
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1920&h=1080&fit=crop&auto=format",
    giftText: "center right",
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
    return () => clearInterval(timer);
  }, [isPaused, promotionsList.length]);

  const currentPromo = promotionsList[activeIndex] || promotionsList[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : promotionsList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < promotionsList.length - 1 ? prev + 1 : 0));
  };

  // Parse transform configuration (position, scale/zoom)
  const imageTransform = (() => {
    const raw = currentPromo.giftText;
    let pos = "center right";
    let scale = 1;

    if (raw) {
      try {
        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          if (parsed.x !== undefined && parsed.y !== undefined) {
            pos = `${parsed.x}% ${parsed.y}%`;
          } else if (parsed.pos) {
            pos = parsed.pos;
          }
          if (parsed.scale) scale = Number(parsed.scale) || 1;
        } else {
          pos = raw;
        }
      } catch (e) {
        pos = raw;
      }
    }

    return {
      objectPosition: pos,
      transform: `scale(${scale})`,
      transformOrigin: pos,
    };
  })();

  return (
    <section 
      className="relative min-h-[640px] sm:min-h-[720px] lg:min-h-[820px] bg-[#0B0D0E] text-white pt-24 sm:pt-28 lg:pt-32 pb-0 flex flex-col justify-between overflow-hidden select-none group/hero"
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
      {/* === 1. CINEMATIC HERO BACKGROUND IMAGE === */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          key={`hero-bg-${currentPromo.id}`}
          src={currentPromo.imageUrl}
          alt={currentPromo.title}
          style={imageTransform}
          className="w-full h-full object-cover hero-fade-in filter brightness-[0.88] contrast-[1.08] transition-all duration-700"
        />
        {/* Balanced Cinematic Gradients: Left darkening for text contrast without blacking out artwork */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D0E]/95 via-[#0B0D0E]/70 to-transparent sm:w-3/4 lg:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0E] via-transparent to-[#0B0D0E]/40" />
      </div>

      {/* === 2. MAIN PROMOTION TYPOGRAPHY & SHOWCASE === */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 lg:px-12 my-auto py-8 sm:py-12">
        <div className="max-w-2xl space-y-4 sm:space-y-5 hero-slide-up" key={`hero-info-${currentPromo.id}`}>
          
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 border border-[#F5B800]/80 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[#F5B800] shadow-md">
            <Leaf className="w-3.5 h-3.5 fill-[#F5B800]" />
            <span className="font-display font-bold text-xs uppercase tracking-widest text-[#F5B800]">
              {currentPromo.tag || "HÀNH TRÌNH XANH"}
            </span>
          </div>

          {/* Giant Bold Title */}
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] uppercase tracking-tight leading-[0.92] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
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
                <div className="h-[2px] w-10 sm:w-14 bg-[#F5B800]" />
                <span className="font-display font-black text-xs sm:text-sm tracking-[0.25em] uppercase text-white drop-shadow">
                  {currentPromo.highlight}
                </span>
                <div className="h-[2px] w-10 sm:w-14 bg-[#F5B800]" />
              </div>
            )}

            {currentPromo.discountValue && (
              <div className="font-display font-black text-5xl sm:text-7xl lg:text-[5.5rem] tracking-tight text-[#F5B800] leading-none drop-shadow-[0_4px_30px_rgba(245,184,0,0.45)]">
                {currentPromo.discountValue}
              </div>
            )}
          </div>

          {/* Campaign Description */}
          {currentPromo.description && (
            <p className="text-gray-300 text-sm sm:text-base max-w-lg leading-relaxed font-light drop-shadow-md">
              {currentPromo.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
            <Link
              href={currentPromo.targetUrl || "/san-pham"}
              className="inline-flex items-center gap-2.5 bg-[#F5B800] hover:bg-white text-black font-display font-black text-sm uppercase tracking-wider px-7 py-3 rounded-lg shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <span>{currentPromo.ctaText || "THAM GIA NGAY"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/san-pham"
              className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-white hover:text-[#F5B800] transition-colors py-2 px-1"
            >
              XEM CHI TIẾT
            </Link>
          </div>

          {/* Slide Navigation Arrows (< >) */}
          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-white/20 bg-black/40 hover:bg-[#F5B800] text-white hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm group/btn"
              aria-label="Previous promotion"
              title="Ưu đãi trước"
            >
              <ChevronLeft className="w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform" />
            </button>

            <div className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm text-xs font-mono font-bold text-gray-300">
              <span className="text-[#F5B800]">{activeIndex + 1}</span>
              <span className="text-gray-500 mx-1.5">/</span>
              <span>{promotionsList.length}</span>
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-white/20 bg-black/40 hover:bg-[#F5B800] text-white hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm group/btn"
              aria-label="Next promotion"
              title="Ưu đãi tiếp theo"
            >
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* Floating Edge Navigation Buttons on Desktop */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-black/30 hover:bg-[#F5B800] text-white hover:text-black items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl backdrop-blur-md opacity-0 group-hover/hero:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-black/30 hover:bg-[#F5B800] text-white hover:text-black items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl backdrop-blur-md opacity-0 group-hover/hero:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}
