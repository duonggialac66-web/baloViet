"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
  rating: number;
  reviews: number;
  spec: string;
  badge: string;
  gradient: string;
  glowColor: string;
  shapeClass: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "BALO LAPTOP PRO",
    slug: "balo-laptop",
    description: "Balo laptop cao cấp tích hợp ngăn chống sốc 360°, đệm lưng thoáng khí AirFlow và cổng sạc USB-C thông minh.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&h=800&fit=crop&auto=format",
    count: 24,
    rating: 4.8,
    reviews: 512,
    spec: "17 inch Laptop",
    badge: "Chống Sốc 360°",
    gradient: "from-[#00F2FE] via-[#4FACFE] to-[#00C6FF]",
    glowColor: "shadow-cyan-500/40",
    shapeClass: "rounded-t-[44px] rounded-b-[24px]",
  },
  {
    id: "cat-2",
    name: "BALO DU LỊCH 45L",
    slug: "balo-du-lich",
    description: "Sức chứa tương đương vali cabin mở phẳng 180°, phân ngăn đồ khô & ướt độc lập cho chuyến đi dài ngày.",
    image: "https://images.unsplash.com/photo-1476979735039-2fdea9e9e407?w=700&h=800&fit=crop&auto=format",
    count: 18,
    rating: 4.9,
    reviews: 840,
    spec: "45L Sức Chứa",
    badge: "Siêu Dung Tích",
    gradient: "from-[#FF0844] via-[#FF4E50] to-[#F9D423]",
    glowColor: "shadow-red-500/40",
    shapeClass: "rounded-t-[24px] rounded-b-[48px]",
  },
  {
    id: "cat-3",
    name: "BALO CHỐNG NƯỚC IPX7",
    slug: "balo-chong-nuoc",
    description: "Công nghệ ép nhiệt siêu âm không đường may với vải TPU dẻo dai. Bảo vệ thiết bị tuyệt đối dưới mưa bão và dã ngoại.",
    image: "https://images.unsplash.com/photo-1622260614927-208cfe3f5cfd?w=700&h=800&fit=crop&auto=format",
    count: 12,
    rating: 5.0,
    reviews: 1329,
    spec: "Kháng Nước IPX7",
    badge: "Kháng Nước 100%",
    gradient: "from-[#1E293B] via-[#0F172A] to-[#020617]",
    glowColor: "shadow-blue-500/50",
    shapeClass: "rounded-[44px] sm:rounded-[52px]",
  },
  {
    id: "cat-4",
    name: "BALO THỜI TRANG URBAN",
    slug: "balo-thoi-trang",
    description: "Phong cách tối giản Đô thị (Urban Futuristic) với chất liệu da PU xước chống bám bẩn và ngăn khóa ẩn chống trộm.",
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=700&h=800&fit=crop&auto=format",
    count: 20,
    rating: 4.7,
    reviews: 620,
    spec: "Slim Futuristic",
    badge: "Urban Minimal",
    gradient: "from-[#00c6ff] via-[#0072ff] to-[#240b36]",
    glowColor: "shadow-indigo-500/40",
    shapeClass: "rounded-t-[48px] rounded-b-[24px]",
  },
  {
    id: "cat-5",
    name: "BALO HỌC SINH ERGONOMIC",
    slug: "balo-hoc-sinh",
    description: "Thiết kế Ergonomic bảo vệ cột sống, dải phản quang đêm 360° cùng trọng lượng siêu nhẹ chống sệ lưng cho học sinh.",
    image: "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=700&h=800&fit=crop&auto=format",
    count: 15,
    rating: 4.9,
    reviews: 410,
    spec: "Siêu Nhẹ 580g",
    badge: "Bảo Vệ Cột Sống",
    gradient: "from-[#F7971E] via-[#FFD200] to-[#F15A24]",
    glowColor: "shadow-amber-500/40",
    shapeClass: "rounded-t-[20px] rounded-b-[44px]",
  },
];

interface CategoryStyleSliderProps {
  initialCategories?: CategoryItem[];
}

export default function CategoryStyleSlider({ initialCategories = [] }: CategoryStyleSliderProps) {
  const items = initialCategories.length > 0 ? initialCategories : CATEGORIES;
  const [activeIndex, setActiveIndex] = useState(() => Math.min(2, Math.max(0, items.length - 1)));

  const activeCategory = items[activeIndex] || items[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="bg-[#0B0D0E] py-6 sm:py-8 lg:py-10 border-t border-gray-850 relative selection:bg-[#F5B800] selection:text-black">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-r from-cyan-600/10 via-amber-500/15 to-blue-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pt-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F5B800] animate-pulse" />
                <span className="text-xs font-bold text-[#F5B800] uppercase tracking-widest">
                  Bộ Sưu Tập Đa Dạng
                </span>
              </div>
              <h2 className="font-display font-black text-white text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
                Chọn balo theo phong cách
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
                Khám phá các dòng sản phẩm được thiết kế chuẩn hóa cho từng nhu cầu di chuyển & làm việc
              </p>
            </div>

            {/* Controls Arrow Buttons */}
            <div className="flex items-center gap-3 self-end sm:self-auto pb-1">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-[#F5B800] hover:text-black border border-white/10 text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                aria-label="Previous Category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-[#F5B800] hover:text-black border border-white/10 text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                aria-label="Next Category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* CAROUSEL TRACK - GPU HARDWARE ACCELERATED 60FPS CARDS CAROUSEL           */}
        {/* ========================================================================= */}
        <div className="relative pt-4 pb-8 min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center">
          
          <div className="w-full flex items-center justify-center gap-3 sm:gap-6 lg:gap-8 overflow-visible">
            {CATEGORIES.map((cat, idx) => {
              const isActive = idx === activeIndex;
              const offset = idx - activeIndex;

              // Show 3 cards on mobile, 5 on desktop
              const isVisibleOnMobile = Math.abs(offset) <= 1;

              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`cursor-pointer transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] select-none relative shrink-0 w-[140px] sm:w-[190px] lg:w-[220px] h-[260px] sm:h-[320px] lg:h-[360px] ${
                    !isVisibleOnMobile ? "hidden sm:block" : "block"
                  } ${
                    isActive
                      ? `z-30 scale-110 sm:scale-120 lg:scale-125 -translate-y-4 sm:-translate-y-6 shadow-2xl ${cat.glowColor}`
                      : "z-10 opacity-70 hover:opacity-100 hover:scale-100 scale-95 translate-y-0 shadow-lg"
                  }`}
                >
                  {/* ORGANIC GRADIENT CARD CONTAINER */}
                  <div
                    className={`w-full h-full relative overflow-hidden bg-gradient-to-b ${cat.gradient} ${cat.shapeClass} p-3.5 sm:p-5 flex flex-col justify-between transition-opacity duration-300 border border-white/25 shadow-2xl`}
                  >
                    {/* CARD TITLE / HEADER */}
                    <div className="relative z-10 text-center pt-1">
                      <h4
                        className={`font-display font-black text-center tracking-tight leading-tight uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                          isActive
                            ? "text-white text-base sm:text-lg lg:text-xl"
                            : "text-white/90 text-xs sm:text-sm"
                        }`}
                      >
                        {cat.name}
                      </h4>
                      {!isActive && (
                        <span className="text-[10px] text-white/90 font-bold bg-black/40 px-2 py-0.5 rounded-full inline-block mt-1 backdrop-blur-sm">
                          {cat.count} Mẫu
                        </span>
                      )}
                    </div>

                    {/* STYLED PRODUCT IMAGE CAPSULE */}
                    <div className="relative w-full flex-1 flex items-center justify-center my-1 sm:my-2">
                      <div
                        className={`relative overflow-hidden transform-gpu transition-transform duration-500 ${
                          isActive
                            ? "w-[85%] aspect-square rounded-2xl border-2 border-white/40 shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                            : "w-[82%] aspect-square rounded-xl border border-white/20 shadow-md opacity-90"
                        }`}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* CENTER ACTIVE CARD METADATA (Floating Glass Pills) */}
                    {isActive && (
                      <div className="relative z-40 mt-auto flex items-center justify-center gap-1.5 animate-fadeIn">
                        
                        {/* Left Glass Pill: Rating Stars & Spec */}
                        <div className="bg-[#0B0D0E]/90 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl text-white shadow-xl flex flex-col items-center">
                          <div className="flex items-center gap-1 text-[#F5B800] text-[9px] sm:text-[10px] font-black">
                            <span>★ ★ ★ ★ ★</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] sm:text-[10px] text-gray-300">
                            <span className="font-bold text-white">{cat.reviews}</span>
                            <span>•</span>
                            <span className="text-[#F5B800] font-semibold">{cat.spec}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FLOOR MIRROR REFLECTION EFFECT */}
                  <div
                    className={`w-full h-[45px] opacity-20 blur-[2px] pointer-events-none transition-opacity duration-300 overflow-hidden transform scale-y-[-0.5] translate-y-[-6px] bg-gradient-to-b ${cat.gradient} ${cat.shapeClass}`}
                  />
                </div>
              );
            })}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTIVE CATEGORY DETAILS DISPLAY (Smooth Fade-in Transition)        */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div
            key={activeCategory.id}
            className="mt-3 pt-6 border-t border-gray-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 bg-[#121518]/90 backdrop-blur-md p-5 sm:p-7 rounded-3xl border border-white/10 transition-all duration-500 animate-fadeIn"
          >
            
            {/* Left Column: Active Info */}
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="bg-[#F5B800] text-black font-black text-xs uppercase px-3 py-1 rounded-lg shadow-md">
                  {activeCategory.badge}
                </span>

                <div className="flex items-center gap-1 text-[#F5B800] text-sm">
                  <span>★ ★ ★ ★ ★</span>
                  <span className="text-white font-bold ml-1.5 text-xs">
                    {activeCategory.rating} / 5.0 ({activeCategory.reviews} Đánh giá)
                  </span>
                </div>
              </div>

              <h3 className="font-display font-black text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight uppercase">
                {activeCategory.name}
              </h3>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mt-2 max-w-2xl">
                {activeCategory.description}
              </p>
            </div>

            {/* Right Column: CTA Button */}
            <div className="w-full lg:w-auto shrink-0">
              <Link
                href={`/danh-muc/${activeCategory.slug}`}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F5B800] to-amber-400 hover:from-white hover:to-white text-black font-display font-black text-xs sm:text-sm uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-[#F5B800]/20 transition-all duration-300 hover:scale-105 group"
              >
                <span>Khám Phá Bộ Sưu Tập</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7M3 12h18" />
                </svg>
              </Link>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
