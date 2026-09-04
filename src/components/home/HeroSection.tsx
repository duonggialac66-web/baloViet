"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import { ArrowRight, ShieldCheck, Zap, Droplets, Wind, Tag, ChevronLeft, ChevronRight } from "lucide-react";

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
  giftText?: string | null;
  ctaText?: string | null;
  targetUrl?: string | null;
  imageUrl: string;
  floatingPerks?: string[] | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

const defaultPromotions: PromoOffer[] = [
  {
    id: "promo-1",
    tag: "CÔNG NGHỆ LÀM MÁT",
    badge: "ICEVIBES™",
    title: "ICEVIBES™",
    highlight: "Sợi Siêu Nhẹ Làm Mát 360°",
    description: "Công nghệ sợi vải thông minh tản nhiệt vượt trội, giảm nhiệt tức thì và tạo cảm giác mát lạnh dễ chịu suốt cả ngày dài vận động.",
    code: "ICEVIBES100K",
    discountValue: "Giảm 100K",
    ctaText: "SĂN DEAL ICEVIBES",
    targetUrl: "/san-pham?tag=icevibes",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&h=900&fit=crop",
  },
  {
    id: "promo-2",
    tag: "THẤU KHÍ TỐI ĐA",
    badge: "AIRDRY™",
    title: "AIRDRY™",
    highlight: "Thoát Khí Gấp 3 Lần",
    description: "Cấu trúc sợi vi xốp gia tăng lưu thông không khí, giữ cho balo và cơ thể luôn khô ráo, không đọng hơi ẩm.",
    code: "AIRDRY200K",
    discountValue: "Trợ giá 200K",
    ctaText: "KHÁM PHÁ AIRDRY",
    targetUrl: "/san-pham?tag=airdry",
    imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1600&h=900&fit=crop",
  },
  {
    id: "promo-3",
    tag: "BẢO VỆ KHÁNG NƯỚC",
    badge: "RAINSHIELD™",
    title: "RAINSHIELD™",
    highlight: "Kháng Nước IPX6 Tuyệt Đối",
    description: "Bề mặt phủ màng trượt nước chuyên dụng, ngăn ngừa nước mưa thấm đọng, bảo vệ an toàn đồ dùng điện tử bên trong.",
    code: "RAINSHIELD15",
    discountValue: "Giảm 15%",
    ctaText: "SĂN DEAL RAINSHIELD",
    targetUrl: "/san-pham?tag=rainshield",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&h=900&fit=crop",
  },
  {
    id: "promo-4",
    tag: "SIÊU BỀN QUÂN SỰ",
    badge: "DURABLETEX™",
    title: "DURABLETEX™",
    highlight: "Chống Trầy & Chịu Lực Cao",
    description: "Chất liệu Cordura D900 cao cấp gia cố đường may đúp, chịu ma sát cực tốt, chống xước rách tối đa khi va đập.",
    code: "DURABLE500K",
    discountValue: "Tiết kiệm 500K",
    ctaText: "XEM CHI TIẾT BỘ SƯU TẬP",
    targetUrl: "/san-pham?tag=durabletex",
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1600&h=900&fit=crop",
  },
];

const AUTO_ROTATE_INTERVAL = 6000;

interface HeroSectionProps {
  initialPromotions?: PromoOffer[];
  products?: any[];
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

  const getTechIcon = (index: number) => {
    switch (index % 4) {
      case 0:
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case 1:
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 2:
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <section 
      className="relative min-h-[calc(100vh-76px)] h-full bg-[#070b12] text-white pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 px-6 sm:px-14 lg:px-20 flex flex-col justify-between overflow-hidden border-b border-gray-800/80 select-none group/hero"
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
      aria-label="Hero Showcase Carousel"
    >
      {/* Dynamic Active Hero Full Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          key={`bg-${currentPromo.id}`}
          src={currentPromo.imageUrl}
          alt={currentPromo.title}
          className="w-full h-full object-cover object-center hero-fade-in"
        />
        {/* Layered Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/80 to-[#070b12]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-[#070b12]/90 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-30" />
      </div>

      {/* ================= FADED NAVIGATION BUTTONS ON BOTH SIDES ================= */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/50 hover:bg-[#FFB800] text-white/80 hover:text-black border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl opacity-30 hover:opacity-100 group-hover/hero:opacity-80 backdrop-blur-md"
        aria-label="Chương trình trước"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/50 hover:bg-[#FFB800] text-white/80 hover:text-black border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl opacity-30 hover:opacity-100 group-hover/hero:opacity-80 backdrop-blur-md"
        aria-label="Chương trình tiếp"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Content Showcase for the Selected 1 Active Promotion */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full my-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Active Promo Showcase (Left & Center Details) */}
          <div key={`content-${currentPromo.id}`} className="lg:col-span-8 space-y-4 hero-slide-up">
            
            {/* Tag & Discount Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-md bg-black/70 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider backdrop-blur-md">
                {currentPromo.tag}
              </span>
              {currentPromo.discountValue && (
                <span className="px-3.5 py-1 rounded-md bg-[#FFB800] text-black font-black text-xs uppercase tracking-wider shadow-lg">
                  {currentPromo.discountValue}
                </span>
              )}
            </div>

            {/* Big Prominent Promotion Program Name Headline */}
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[80px] xl:text-[90px] uppercase tracking-tight leading-[1.01] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
              {currentPromo.badge || currentPromo.title}
              {currentPromo.highlight && (
                <span className="block text-[#FFB800] drop-shadow-[0_0_35px_rgba(255,184,0,0.5)] text-3xl sm:text-5xl lg:text-6xl font-extrabold mt-1.5">
                  {currentPromo.highlight}
                </span>
              )}
            </h1>

            {/* Description */}
            <div className="max-w-2xl pt-1">
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed font-light drop-shadow-md line-clamp-3">
                {currentPromo.description}
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                href={currentPromo.targetUrl || "/san-pham"}
                className="inline-flex items-center gap-3 bg-[#FFB800] text-black font-extrabold text-xs sm:text-sm uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-white transition-all shadow-2xl hover:scale-105 group"
              >
                <span>{currentPromo.ctaText || "SĂN DEAL NGAY"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Card Spotlight */}
          <div key={`card-${currentPromo.id}`} className="hidden lg:flex lg:col-span-4 justify-center items-center hero-scale-up">
            <div className="relative w-full max-w-[360px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_45px_rgba(6,182,212,0.35)] bg-gray-950 p-4 flex flex-col justify-between group">
              <img
                src={currentPromo.imageUrl}
                alt={currentPromo.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
              <div className="relative z-10 flex justify-between">
                <span className="px-2.5 py-1 rounded bg-black/80 text-[11px] font-bold text-white font-mono border border-white/20">
                  PROGRAM 0{activeIndex + 1}
                </span>
              </div>

              <div className="relative z-10 rounded-xl bg-cyan-950/90 border border-cyan-400/60 p-3.5 backdrop-blur-md">
                <h3 className="font-black text-lg text-cyan-200 uppercase">{currentPromo.badge || currentPromo.title}</h3>
                <p className="text-xs text-cyan-300/80 font-mono">{currentPromo.highlight}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM CAROUSEL SELECTOR (4 Cards Carousel) ================= */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full pt-3 border-t border-gray-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#FFB800]" />
            Chọn chương trình ưu đãi để xem chi tiết ({activeIndex + 1}/{promotionsList.length})
          </span>
        </div>

        {/* Carousel Grid / Horizontal List of 4 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {promotionsList.slice(0, 4).map((promo, idx) => {
            const isSelected = activeIndex === idx;

            return (
              <div
                key={promo.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 p-2.5 border ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]"
                    : "bg-gray-900/80 hover:bg-gray-800/90 border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                {/* Background Thumbnail Image */}
                <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${isSelected ? "bg-cyan-500/20 border-cyan-400" : "bg-black/40 border-white/10"}`}>
                      {getTechIcon(idx)}
                    </div>
                    <div>
                      <h4 className={`font-black text-xs sm:text-sm uppercase tracking-wide ${isSelected ? "text-cyan-200" : "text-white"}`}>
                        {promo.badge || promo.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono line-clamp-1">{promo.highlight}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


