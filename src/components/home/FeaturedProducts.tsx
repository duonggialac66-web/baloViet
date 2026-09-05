"use client";

import { useState, useRef, useEffect } from "react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const [viewMode, setViewMode] = useState<"slider" | "grid">("slider");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll controls & progress
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(100);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const progress = Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100));
    setScrollProgress(progress);
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products, viewMode]);

  const handleScroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-14 sm:py-20 bg-gradient-to-b from-[#F9FAFB] via-[#F3F4F6] to-[#E5E7EB] text-[#0B0D0E] overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F5B800]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        {/* --- HEADER SECTION --- */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0D0E] text-[#F5B800] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#F5B800] animate-ping" />
                <span>Tuyển chọn đặc biệt 2026</span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-display font-black text-[#0B0D0E] text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
                Sản phẩm nổi bật
              </h2>
              <p className="text-[#4B5563] text-sm sm:text-base mt-2 max-w-2xl font-medium">
                Khám phá những thiết kế đỉnh cao với công nghệ chống sốc 360°, kháng nước vượt trội và chuẩn công thái học.
              </p>
            </div>

            {/* Action Buttons & View Controls */}
            <div className="flex items-center gap-3 self-start md:self-end">
              {/* View Mode Switcher */}
              <div className="hidden sm:flex items-center p-1 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewMode("slider")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "slider"
                      ? "bg-[#0B0D0E] text-[#F5B800] shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  aria-label="Chế độ lướt ngang"
                  title="Chế độ lướt ngang"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="6" height="14" rx="1" />
                    <rect x="10" y="5" width="6" height="14" rx="1" />
                    <rect x="18" y="5" width="4" height="14" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-[#0B0D0E] text-[#F5B800] shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  aria-label="Chế độ lưới"
                  title="Chế độ lưới"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
              </div>

              {/* Slider Prev / Next Controls (Only in slider mode) */}
              {viewMode === "slider" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScroll("left")}
                    disabled={!canScrollLeft}
                    className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-800 flex items-center justify-center hover:bg-[#0B0D0E] hover:text-[#F5B800] hover:border-[#0B0D0E] transition-all duration-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-800 disabled:hover:border-gray-200 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95"
                    aria-label="Cuộn sang trái"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleScroll("right")}
                    disabled={!canScrollRight}
                    className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-800 flex items-center justify-center hover:bg-[#0B0D0E] hover:text-[#F5B800] hover:border-[#0B0D0E] transition-all duration-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-800 disabled:hover:border-gray-200 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95"
                    aria-label="Cuộn sang phải"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* View All Link */}
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 bg-[#0B0D0E] hover:bg-[#F5B800] text-white hover:text-black px-4 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg group shrink-0"
              >
                <span>Xem tất cả</span>
                <span className="bg-white/20 group-hover:bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full transition-colors">
                  {products.length}
                </span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* --- PRODUCT DISPLAY CONTAINER --- */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 my-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
              🎒
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Vui lòng quay lại xem tất cả sản phẩm.
            </p>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 bg-[#F5B800] text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black hover:text-[#F5B800] transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : viewMode === "slider" ? (
          /* ======================================================= */
          /* SLIDER MODE (Smooth Carousel Track with Edge Fades)      */
          /* ======================================================= */
          <div className="relative group">
            <div
              ref={scrollRef}
              className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide py-3 px-1 snap-x snap-mandatory scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[170px] xs:w-[210px] sm:w-[280px] lg:w-[320px] snap-start"
                >
                  <ProductCard product={product} variant="featured" />
                </div>
              ))}
            </div>

            {/* Scroll Progress Bar */}
            <div className="mt-6 flex items-center justify-between gap-4 pt-2">
              <div className="flex-1 max-w-xs h-1.5 bg-gray-300/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0B0D0E] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(15, scrollProgress)}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-gray-500">
                Hiển thị <span className="text-[#0B0D0E] font-bold">{products.length}</span> sản phẩm nổi bật
              </p>
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* GRID MODE (Responsive 2-Column Mobile & 4-Column Desktop)*/
          /* ======================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 py-2">
            {products.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
