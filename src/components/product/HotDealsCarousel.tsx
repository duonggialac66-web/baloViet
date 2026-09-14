"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Tag, Gift, Sparkles, Percent } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

export interface PromotionItem {
  id: string;
  tag?: string | null;
  badge?: string | null;
  title?: string | null;
  highlight?: string | null;
  discountValue?: string | null;
  description?: string | null;
  code?: string | null;
  ctaText?: string | null;
  targetUrl?: string | null;
  imageUrl?: string | null;
}

interface HotDealsCarouselProps {
  products: Product[];
  promotions?: PromotionItem[];
}

export default function HotDealsCarousel({ products, promotions = [] }: HotDealsCarouselProps) {
  // Combine promotions and discounted products into unified Deal items
  const dealsList = useMemo(() => {
    const items: Array<{
      id: string;
      tag: string;
      title: string;
      discountText: string;
      description: string;
      imageUrl: string;
      targetUrl: string;
      code?: string;
      ctaText: string;
      isPromotion: boolean;
      originalPrice?: string;
      salePrice?: string;
    }> = [];

    // 1. Add DB Promotions
    if (promotions.length > 0) {
      promotions.forEach((p) => {
        items.push({
          id: p.id,
          tag: p.tag || p.badge || "ƯU ĐÃI ĐẶC BIỆT",
          title: (p.title || "Chương trình ưu đãi").replace(/\n/g, " "),
          discountText: p.discountValue || p.highlight || "HOT DEAL",
          description: p.description || "Chương trình khuyến mãi giới hạn số lượng.",
          imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80",
          targetUrl: p.targetUrl || "/san-pham",
          code: p.code || undefined,
          ctaText: p.ctaText || "SĂN DEAL NGAY",
          isPromotion: true,
        });
      });
    }

    // 2. Add Sale Products
    const saleProducts = products.filter((p) => p.salePrice && p.salePrice < p.price);
    saleProducts.forEach((p) => {
      const discountPct = Math.round(((p.price - (p.salePrice || p.price)) / p.price) * 100);
      items.push({
        id: `prod-${p.id}`,
        tag: `GIẢM ${discountPct}%`,
        title: p.name,
        discountText: formatPrice(p.salePrice || p.price),
        originalPrice: formatPrice(p.price),
        salePrice: formatPrice(p.salePrice || p.price),
        description: p.shortDescription || "Balo chính hãng cao cấp - số lượng có hạn.",
        imageUrl: p.images?.[0]?.url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80",
        targetUrl: `/san-pham/${p.slug}`,
        ctaText: "MUA NGAY",
        isPromotion: false,
      });
    });

    if (items.length >= 3) return items;

    // Fallback bestsellers
    const bestSellers = products.filter((p) => p.isBestSeller);
    bestSellers.forEach((p) => {
      if (!items.some((it) => it.id === `prod-${p.id}`)) {
        items.push({
          id: `prod-${p.id}`,
          tag: "BEST SELLER",
          title: p.name,
          discountText: formatPrice(p.price),
          description: p.shortDescription || "Mẫu balo bán chạy nhất Balo Việt.",
          imageUrl: p.images?.[0]?.url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80",
          targetUrl: `/san-pham/${p.slug}`,
          ctaText: "XEM CHI TIẾT",
          isPromotion: false,
        });
      }
    });

    return items;
  }, [products, promotions]);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (dealsList.length === 0) return null;

  const total = dealsList.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  const prevItem = dealsList[(currentIndex - 1 + total) % total];
  const activeItem = dealsList[currentIndex];
  const nextItem = dealsList[(currentIndex + 1) % total];

  return (
    <section id="hot-deals" className="relative bg-[#090A0B] py-20 sm:py-28 overflow-hidden select-none border-b border-[#18191C]">
      {/* Background ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#F5B800]/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Centered Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5B800]/10 border border-[#F5B800]/30 text-[#F5B800] text-xs font-bold uppercase tracking-widest mb-3">
            <Gift className="w-3.5 h-3.5" />
            CHƯƠNG TRÌNH KHUYẾN MÃI
          </div>
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight font-bold">
            Hot Deals & Ưu Đãi Đặc Biệt
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-sans">Săn voucher trợ giá & sản phẩm giảm sâu — số lượng có hạn</p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 sm:left-4 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-white/15 bg-black/70 hover:bg-[#F5B800] hover:text-black transition-colors flex items-center justify-center text-white text-base sm:text-xl shadow-xl active:scale-95 cursor-pointer backdrop-blur-sm"
            aria-label="Previous Deal"
          >
            ←
          </button>

          {/* 3 Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-stretch w-full max-w-6xl mx-auto px-5 sm:px-12">
            
            {/* 1. LEFT CARD */}
            <div className="hidden md:block transition-all duration-500 hover:scale-105">
              <Link
                href={prevItem.targetUrl}
                className="block h-full bg-[#121316] border border-white/10 hover:border-[#F5B800]/50 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl group flex flex-col justify-between"
              >
                {/* Tag Badge */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#F5B800] font-bold text-[11px] uppercase tracking-wider">
                    {prevItem.tag}
                  </span>
                  {prevItem.code && (
                    <span className="text-[10px] font-mono font-bold text-gray-400 border border-gray-700 px-2 py-0.5 rounded">
                      MÃ: {prevItem.code}
                    </span>
                  )}
                </div>

                {/* Center Image */}
                <div className="my-4 py-2 w-full h-[200px] flex items-center justify-center relative">
                  <img
                    src={prevItem.imageUrl}
                    alt={prevItem.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                    loading="lazy"
                  />
                </div>

                {/* Footer Info */}
                <div className="space-y-2 pt-2 border-t border-white/10 z-10">
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#F5B800] transition-colors">
                    {prevItem.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#F5B800] text-base">
                      {prevItem.discountText}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-white flex items-center gap-1">
                      {prevItem.ctaText} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* 2. CENTER CARD: GOLD ACCENT (ACTIVE DEAL) */}
            <div className="w-full transition-all duration-500 scale-100 md:scale-105 z-20">
              <Link
                href={activeItem.targetUrl}
                className="block h-full bg-gradient-to-br from-[#F5B800] via-[#E5AB00] to-[#C49200] text-[#0B0D0E] rounded-3xl p-7 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(245,184,0,0.4)] group cursor-pointer flex flex-col justify-between border-2 border-[#FFE885]"
              >
                {/* Top Tag & Highlight */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3.5 py-1 rounded-full bg-black text-[#F5B800] font-black text-xs uppercase tracking-wider shadow">
                    🔥 {activeItem.tag}
                  </span>
                  {activeItem.code && (
                    <span className="text-xs font-mono font-black text-black bg-white/40 border border-black/20 px-2.5 py-1 rounded-lg">
                      MÃ: {activeItem.code}
                    </span>
                  )}
                </div>

                {/* Center Image with floating effect */}
                <div className="my-6 py-2 w-full h-[220px] flex items-center justify-center relative">
                  <img
                    src={activeItem.imageUrl}
                    alt={activeItem.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                    loading="lazy"
                  />
                </div>

                {/* Footer Content */}
                <div className="space-y-3 pt-3 border-t border-black/15 z-10">
                  <h3 className="font-extrabold text-black text-lg line-clamp-1">
                    {activeItem.title}
                  </h3>
                  
                  <p className="text-black/80 text-xs line-clamp-2 leading-relaxed font-medium">
                    {activeItem.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="block text-2xl font-black text-black leading-none">
                        {activeItem.discountText}
                      </span>
                      {activeItem.originalPrice && (
                        <span className="text-xs font-bold line-through text-black/60">
                          {activeItem.originalPrice}
                        </span>
                      )}
                    </div>

                    <span className="px-5 py-2.5 bg-black text-[#F5B800] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg group-hover:bg-white group-hover:text-black transition-colors flex items-center gap-1.5">
                      <span>{activeItem.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* 3. RIGHT CARD */}
            <div className="hidden md:block transition-all duration-500 hover:scale-105">
              <Link
                href={nextItem.targetUrl}
                className="block h-full bg-[#121316] border border-white/10 hover:border-[#F5B800]/50 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl group flex flex-col justify-between"
              >
                {/* Tag Badge */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#F5B800] font-bold text-[11px] uppercase tracking-wider">
                    {nextItem.tag}
                  </span>
                  {nextItem.code && (
                    <span className="text-[10px] font-mono font-bold text-gray-400 border border-gray-700 px-2 py-0.5 rounded">
                      MÃ: {nextItem.code}
                    </span>
                  )}
                </div>

                {/* Center Image */}
                <div className="my-4 py-2 w-full h-[200px] flex items-center justify-center relative">
                  <img
                    src={nextItem.imageUrl}
                    alt={nextItem.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                    loading="lazy"
                  />
                </div>

                {/* Footer Info */}
                <div className="space-y-2 pt-2 border-t border-white/10 z-10">
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#F5B800] transition-colors">
                    {nextItem.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#F5B800] text-base">
                      {nextItem.discountText}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-white flex items-center gap-1">
                      {nextItem.ctaText} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 sm:right-4 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-white/15 bg-black/70 hover:bg-[#F5B800] hover:text-black transition-colors flex items-center justify-center text-white text-base sm:text-xl shadow-xl active:scale-95 cursor-pointer backdrop-blur-sm"
            aria-label="Next Deal"
          >
            →
          </button>
        </div>

        {/* Dashed Curved Arc Decor */}
        <div className="mt-12 flex justify-center">
          <svg className="w-full max-w-3xl h-6 text-[#F5B800]/40" viewBox="0 0 800 30" fill="none">
            <path
              d="M 10 5 Q 400 35 790 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
