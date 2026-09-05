"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  price?: string;
  subtitle?: string;
  gradient?: string;
  glowColor?: string;
  shapeClass?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "BALO LAPTOP",
    slug: "balo-laptop",
    subtitle: "Chống Sốc 360° • Cổng Sạc USB-C",
    description: "Balo laptop cao cấp với đệm chống sốc tổ ong 360°, đệm lưng thoáng khí AirFlow và cổng kết nối thông minh.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
    count: 24,
    rating: 4.9,
    reviews: 512,
    spec: "Laptop 15.6 - 17.3 inch",
    badge: "Best Seller",
    price: "790.000₫",
  },
  {
    id: "cat-2",
    name: "BALO DU LỊCH",
    slug: "balo-du-lich",
    subtitle: "Sức Chứa 45L • Mở Phẳng 180° Cabin",
    description: "Dung tích tương đương vali cabin, phân ngăn đồ khô & ướt độc lập hoàn hảo cho các chuyến công tác và du lịch.",
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop&auto=format",
    count: 18,
    rating: 4.9,
    reviews: 840,
    spec: "Dung tích 45L Siêu Chứa",
    badge: "Cabin Approved",
    price: "890.000₫",
  },
  {
    id: "cat-3",
    name: "BALO CHỐNG NƯỚC",
    slug: "balo-chong-nuoc",
    subtitle: "Chuẩn Kháng Nước IPX7 • Ép Nhiệt TPU",
    description: "Chất liệu TPU tráng phủ nano cao cấp kết hợp khóa kéo kín nước, bảo vệ thiết bị tuyệt đối dưới mọi cơn mưa bão.",
    image: "https://images.unsplash.com/photo-1622260614927-208cfe3f5cfd?w=800&h=800&fit=crop&auto=format",
    count: 12,
    rating: 5.0,
    reviews: 1320,
    spec: "Kháng Nước Toàn Diện IPX7",
    badge: "100% Waterproof",
    price: "950.000₫",
  },
  {
    id: "cat-4",
    name: "BALO THỜI TRANG",
    slug: "balo-thoi-trang",
    subtitle: "Urban Futuristic • Tối Giản Hiện Đại",
    description: "Thiết kế đường nét công nghệ vị lai, da PU cao cấp chống xước với ngăn khóa ẩn chống trộm an toàn nơi đông người.",
    image: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&h=800&fit=crop&auto=format",
    count: 20,
    rating: 4.8,
    reviews: 620,
    spec: "Slim Minimalist",
    badge: "Urban Trending",
    price: "720.000₫",
  },
  {
    id: "cat-5",
    name: "BALO HỌC SINH",
    slug: "balo-hoc-sinh",
    subtitle: "Bảo Vệ Cột Sống • Siêu Nhẹ 550g",
    description: "Chuẩn công thái học Ergonomic trợ lực giảm tải trọng lượng lên cột sống, tích hợp dải phản quang đêm 360° an toàn.",
    image: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&h=800&fit=crop&auto=format",
    count: 16,
    rating: 4.9,
    reviews: 450,
    spec: "Ergonomic Giảm 30% Tải Trọng",
    badge: "Bảo Vệ Cột Sống",
    price: "650.000₫",
  },
];

interface CategoryStyleSliderProps {
  initialCategories?: CategoryItem[];
}

export default function CategoryStyleSlider({ initialCategories = [] }: CategoryStyleSliderProps) {
  const items = initialCategories.length > 0
    ? initialCategories.map((cat, idx) => ({
      ...cat,
      subtitle: cat.subtitle || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].subtitle,
      price: cat.price || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].price || "690.000₫",
    }))
    : DEFAULT_CATEGORIES;

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const total = items.length;
  const activeCategory = items[activeIndex] || items[0];

  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const prevCategory = items[prevIndex];
  const nextCategory = items[nextIndex];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch Swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    setTouchStartX(null);
  };

  return (
    <section className="relative bg-[#ECEEF0] text-[#0B0D0E] py-16 sm:py-24 overflow-hidden select-none border-t border-gray-200">
      {/* Studio Radial Ambient Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFFFFF_0%,_#ECEEF0_70%,_#E1E4E8_100%)] pointer-events-none" />

      {/* Subtle Background Studio Grid / Glow Lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/60 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* --- MAIN 3D SHOWCASE ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[480px] sm:min-h-[540px] pt-4 sm:pt-6">

          {/* ========================================================= */}
          {/* LEFT COLUMN: VERTICAL EDITORIAL CATEGORY SELECTOR         */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 z-20 flex flex-col justify-start space-y-4 sm:space-y-5 pt-2 sm:pt-4 -translate-y-1 sm:-translate-y-3">
            {/* Highlighted Badge Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0B0D0E] text-white shadow-lg shadow-black/10 border border-[#2A2C2F] mb-2 self-start">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800] shadow-sm animate-pulse" />
              <span className="text-xs sm:text-sm font-display font-black tracking-widest uppercase text-[#F5B800]">
                CHỌN BALO THEO PHONG CÁCH
              </span>
            </div>

            {items.map((category, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={category.id}
                  onClick={() => setActiveIndex(idx)}
                  className="cursor-pointer group flex flex-col transition-all duration-300"
                >
                  <h3
                    className={`font-display font-black tracking-tighter uppercase transition-all duration-500 ${isActive
                        ? "text-[#0B0D0E] text-3xl sm:text-4xl lg:text-5xl translate-x-2 drop-shadow-md scale-105 origin-left"
                        : "text-stroke-editorial text-2xl sm:text-3xl lg:text-4xl hover:translate-x-1 hover:text-black/30"
                      }`}
                  >
                    {category.name}
                  </h3>

                  {/* Active Subtitle metadata line */}
                  {isActive && (
                    <div className="flex items-center gap-2 mt-1.5 ml-2.5 text-xs sm:text-sm font-semibold text-gray-700 animate-fadeup">
                      <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-sm animate-pulse" />
                      <span>{category.subtitle || category.spec}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* CENTER / RIGHT STAGE: 3D FLOATING BACKPACK CAROUSEL       */}
          {/* ========================================================= */}
          <div
            ref={stageRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="lg:col-span-7 relative w-full h-[360px] sm:h-[440px] lg:h-[480px] flex items-center justify-center overflow-visible"
          >
            {/* --- PREVIOUS ITEM (Left Floating in Perspective) --- */}
            {prevCategory && (
              <div
                onClick={handlePrev}
                className="absolute left-0 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 w-[180px] sm:w-[240px] lg:w-[280px] cursor-pointer z-10 transition-all duration-700 ease-out -rotate-18 scale-75 opacity-40 hover:opacity-75 hover:scale-85 blur-[1.5px] hover:blur-none"
                title={`Xem ${prevCategory.name}`}
              >
                <div className="relative flex flex-col items-center">
                  <img
                    src={prevCategory.image}
                    alt={prevCategory.name}
                    className="w-full h-auto max-h-[260px] sm:max-h-[300px] object-contain drop-shadow-2xl pointer-events-none"
                  />
                  {/* Floating shadow */}
                  <div className="w-36 sm:w-48 h-6 bg-black/30 blur-md rounded-full mt-4 scale-y-50" />
                </div>
              </div>
            )}

            {/* --- ACTIVE ITEM (Center 3D Floating & Levitation) --- */}
            <div className="relative z-30 w-[240px] sm:w-[320px] lg:w-[380px] flex flex-col items-center justify-center">

              {/* Product Floating Image Container with Tilted Levitation */}
              <div className="relative animate-float-levitate transition-all duration-700">
                <Link
                  href={`/danh-muc/${activeCategory.slug}`}
                  className="block group cursor-pointer"
                  aria-label={activeCategory.name}
                >
                  <img
                    key={activeCategory.id}
                    src={activeCategory.image}
                    alt={activeCategory.name}
                    className="w-full h-auto max-h-[290px] sm:max-h-[380px] lg:max-h-[420px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              </div>

              {/* Dynamic 3D Ground Shadow that pulses with levitation */}
              <div className="w-48 sm:w-64 lg:w-72 h-8 sm:h-10 bg-black/35 blur-xl rounded-full animate-shadow-pulse pointer-events-none mt-2 scale-y-50" />
            </div>

            {/* --- NEXT ITEM (Right Floating in Perspective) --- */}
            {nextCategory && (
              <div
                onClick={handleNext}
                className="absolute right-0 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 w-[180px] sm:w-[240px] lg:w-[280px] cursor-pointer z-10 transition-all duration-700 ease-out rotate-18 scale-75 opacity-40 hover:opacity-75 hover:scale-85 blur-[1.5px] hover:blur-none"
                title={`Xem ${nextCategory.name}`}
              >
                <div className="relative flex flex-col items-center">
                  <img
                    src={nextCategory.image}
                    alt={nextCategory.name}
                    className="w-full h-auto max-h-[260px] sm:max-h-[300px] object-contain drop-shadow-2xl pointer-events-none"
                  />
                  {/* Floating shadow */}
                  <div className="w-36 sm:w-48 h-6 bg-black/30 blur-md rounded-full mt-4 scale-y-50" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM CENTER: EDITORIAL BRAND TITLE, SPECS & SEE MORE CTA */}
        {/* ========================================================= */}
        <ScrollReveal>
          <div className="mt-8 sm:mt-12 text-center flex flex-col items-center justify-center animate-fadeIn">

            {/* Big Editorial Title */}
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight uppercase text-[#0B0D0E] leading-none drop-shadow-sm">
              {activeCategory.name}
            </h2>

            {/* Subtitle / Spec / Price */}
            <p className="text-gray-500 font-medium text-xs sm:text-sm uppercase tracking-widest mt-2 sm:mt-3 max-w-xl">
              {activeCategory.subtitle || activeCategory.description} &bull; <span className="text-[#0B0D0E] font-bold">TỪ {activeCategory.price || "690.000₫"}</span>
            </p>

            {/* Clean Pill CTA Button ("SEE MORE") */}
            <div className="mt-5 sm:mt-6">
              <Link
                href={`/danh-muc/${activeCategory.slug}`}
                className="inline-flex items-center gap-3 bg-[#0B0D0E] hover:bg-[#F5B800] text-white hover:text-black font-display font-bold text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-full shadow-2xl hover:shadow-[#F5B800]/30 transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <span>XEM BỘ SƯU TẬP</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
