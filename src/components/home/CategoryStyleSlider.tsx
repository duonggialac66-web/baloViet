"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Sparkles, Check, ChevronRight } from "lucide-react";

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
    name: "Balo Laptop Pro",
    slug: "balo-laptop",
    subtitle: "Chống Sốc 360° • Cổng USB-C",
    description: "Balo laptop cao cấp với đệm chống sốc tổ ong 360°, đệm lưng thoáng khí AirFlow và cổng kết nối thông minh.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
    count: 24,
    rating: 4.9,
    reviews: 512,
    spec: "Laptop 15.6 - 17.3\"",
    badge: "Best Seller",
    price: "790.000₫",
    gradient: "from-[#2DD4BF] to-[#0D9488]",
    glowColor: "#2DD4BF",
  },
  {
    id: "cat-2",
    name: "Balo Du Lịch 45L",
    slug: "balo-du-lich",
    subtitle: "Sức Chứa 45L • Mở 180° Cabin",
    description: "Dung tích tương đương vali cabin, phân ngăn đồ khô & ướt độc lập hoàn hảo cho các chuyến công tác và du lịch.",
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop&auto=format",
    count: 18,
    rating: 4.9,
    reviews: 840,
    spec: "Vali Cabin 45 Liters",
    badge: "Cabin Approved",
    price: "890.000₫",
    gradient: "from-[#38BDF8] to-[#0284C7]",
    glowColor: "#38BDF8",
  },
  {
    id: "cat-3",
    name: "Balo Chống Nước IPX7",
    slug: "balo-chong-nuoc",
    subtitle: "Kháng Nước IPX7 • TPU Ép Nhiệt",
    description: "Chất liệu TPU tráng phủ nano cao cấp kết hợp khóa kéo kín nước, bảo vệ thiết bị tuyệt đối dưới mọi cơn mưa bão.",
    image: "https://images.unsplash.com/photo-1622260614927-208cfe3f5cfd?w=800&h=800&fit=crop&auto=format",
    count: 12,
    rating: 5.0,
    reviews: 1320,
    spec: "Kháng Nước IPX7",
    badge: "100% Waterproof",
    price: "950.000₫",
    gradient: "from-[#10B981] to-[#059669]",
    glowColor: "#10B981",
  },
  {
    id: "cat-4",
    name: "Balo Thời Trang Minimal",
    slug: "balo-thoi-trang",
    subtitle: "Urban Futuristic • Tối Giản",
    description: "Thiết kế đường nét công nghệ vị lai, da PU cao cấp chống xước với ngăn khóa ẩn chống trộm an toàn.",
    image: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&h=800&fit=crop&auto=format",
    count: 20,
    rating: 4.8,
    reviews: 620,
    spec: "Slim Futuristic",
    badge: "Urban Trending",
    price: "720.000₫",
    gradient: "from-[#F5B800] to-[#D97706]",
    glowColor: "#F5B800",
  },
  {
    id: "cat-5",
    name: "Balo Học Sinh Ergonomic",
    slug: "balo-hoc-sinh",
    subtitle: "Bảo Vệ Cột Sống • Siêu Nhẹ 550g",
    description: "Chuẩn công thái học Ergonomic trợ lực giảm tải trọng lượng lên cột sống, tích hợp dải phản quang đêm 360°.",
    image: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&h=800&fit=crop&auto=format",
    count: 16,
    rating: 4.9,
    reviews: 450,
    spec: "Ergonomic 550g",
    badge: "Bảo Vệ Cột Sống",
    price: "650.000₫",
    gradient: "from-[#818CF8] to-[#4F46E5]",
    glowColor: "#818CF8",
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
        gradient: DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].gradient,
        glowColor: DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].glowColor,
      }))
    : DEFAULT_CATEGORIES;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = items[activeIndex] || items[0];

  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  return (
    <section 
      className="relative bg-[#EAECEE] text-[#0B0D0E] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Studio Radial Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFFFFF_0%,_#EAECEE_75%,_#DFE2E6_100%)] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto relative z-10">
        
        {/* Main Card Shell (Rounded Neumorphic / Glassmorphic Card Container) */}
        <div className="bg-[#F8F9FA]/90 backdrop-blur-2xl border border-white/80 rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.07)] p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

            {/* ========================================================= */}
            {/* LEFT COLUMN: VIBRANT 3D PRODUCT SHOWCASE BLOB STAGE      */}
            {/* ========================================================= */}
            <Link
              href={`/san-pham?category=${activeCategory.slug}#brows-latest-products`}
              className="lg:col-span-6 relative flex flex-col justify-between h-[420px] sm:h-[480px] lg:h-[520px] rounded-[28px] overflow-hidden p-6 sm:p-10 shadow-inner group cursor-pointer"
            >
              
              {/* Dynamic Fluid Blob Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${activeCategory.gradient || "from-[#2DD4BF] to-[#0D9488]"} transition-all duration-700 rounded-[28px]`}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)",
                }}
              />

              {/* Decorative Fluid Blob Shape Accent */}
              <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/20 blur-2xl rounded-full pointer-events-none" />
              
              {/* Floating Soft White Cloud/Pill Accent for 3D Depth */}
              <div className="absolute top-1/2 left-6 -translate-y-1/2 w-28 h-12 bg-white/40 backdrop-blur-md rounded-full pointer-events-none animate-pulse opacity-80" />

              {/* Title & Badge Overlay on top of color blob */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{activeCategory.badge || "Danh Mục Nổi Bật"}</span>
                </div>

                <div className="h-[2.4em] flex items-center">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1] drop-shadow-md transition-all duration-500 group-hover:text-[#F5B800] line-clamp-2">
                    {activeCategory.name}
                  </h2>
                </div>
              </div>

              {/* Central 3D Backpack Product Image with Levitation */}
              <div className="relative z-20 my-auto flex items-center justify-center py-2 h-[220px] sm:h-[260px] lg:h-[280px]">
                <div className="relative w-full h-full max-w-[260px] sm:max-w-[320px] aspect-square flex items-center justify-center">
                  <img
                    key={`showcase-${activeCategory.id}`}
                    src={activeCategory.image}
                    alt={activeCategory.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)] animate-float-levitate transition-all duration-700 group-hover:scale-105"
                  />
                  {/* Pulsing Ground Shadow */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-6 bg-black/30 blur-xl rounded-full scale-y-50 pointer-events-none animate-shadow-pulse" />
                </div>
              </div>

              {/* Bottom Info Pills inside Showcase Stage */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20">
                <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1 truncate max-w-[70%]">
                  <span className="truncate">{activeCategory.subtitle}</span>
                  <span className="text-[#F5B800] ml-1 shrink-0">↗</span>
                </span>
                <span className="text-white font-black text-base sm:text-lg shrink-0">
                  {activeCategory.price}
                </span>
              </div>

            </Link>

            {/* ========================================================= */}
            {/* RIGHT COLUMN: STOREHOUSE INTERACTIVE PRODUCT TABLE LIST   */}
            {/* ========================================================= */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              
              <div>
                {/* Header Title Section */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 font-mono">
                      DANH MỤC BALO VIỆT
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black text-[#0B0D0E] tracking-tight uppercase mt-0.5">
                      Phong cách nổi bật
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 font-bold text-sm">
                    ★
                  </div>
                </div>

                {/* Table Column Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200/70 font-mono">
                  <span className="col-span-7 sm:col-span-7">Danh Mục Sản Phẩm</span>
                  <span className="col-span-5 sm:col-span-5 text-right">Thông Số Kỹ Thuật</span>
                </div>

                {/* Interactive List Rows */}
                <div className="space-y-2 mt-2">
                  {items.map((cat, idx) => {
                    const isActive = idx === activeIndex;

                    return (
                      <Link
                        key={cat.id}
                        href={`/san-pham?category=${cat.slug}#brows-latest-products`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => setActiveIndex(idx)}
                        className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group ${
                          isActive
                            ? "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-200/80 font-bold"
                            : "hover:bg-white/60 border border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        {/* 1. Item Name */}
                        <div className="col-span-7 sm:col-span-7 flex items-center gap-2.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 shrink-0 ${
                              isActive ? "bg-[#0B0D0E] scale-125" : "bg-gray-300"
                            }`}
                          />
                          <div>
                            <span
                              className={`font-bold text-sm sm:text-base transition-colors line-clamp-1 group-hover:text-[#F5B800] ${
                                isActive ? "text-[#0B0D0E] font-black" : "text-gray-700"
                              }`}
                            >
                              {cat.name}
                            </span>
                            <p className="text-[11px] text-gray-400 line-clamp-1 font-normal">
                              {cat.count} mẫu có sẵn
                            </p>
                          </div>
                        </div>

                        {/* 2. Spec Tag */}
                        <div className="col-span-5 sm:col-span-5 flex justify-end items-center gap-2">
                          <span className="inline-block text-[11px] font-mono font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/60 truncate max-w-full">
                            {cat.spec}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-[#0B0D0E] group-hover:text-white flex items-center justify-center text-xs text-gray-500 transition-colors shrink-0">
                            ↗
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Footer Control Bar (Floating Pill) */}
              <div className="pt-3">
                <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-lg rounded-full px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
                      Đang xem: {activeCategory.name}
                    </span>
                  </div>

                  <Link
                    href={`/san-pham?category=${activeCategory.slug}#brows-latest-products`}
                    className="px-5 py-2.5 rounded-full bg-[#0B0D0E] hover:bg-[#F5B800] text-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-md group"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
