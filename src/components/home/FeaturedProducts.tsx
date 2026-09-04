"use client";

import { useRef } from "react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-20 bg-[#F3F1EB]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10 reveal-up">
          <div>
            <h2 className="font-display font-black text-[#0B0D0E] text-3xl lg:text-4xl uppercase tracking-tight">
              Sản phẩm nổi bật
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/san-pham"
              className="hidden sm:inline-flex items-center gap-2 text-[#0B0D0E] font-display font-bold uppercase tracking-widest text-xs hover:text-[#F5B800] transition-colors"
            >
              Xem tất cả
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 relative"
        >
          {products.map((product, index) => (
            <div key={product.id} className="flex-shrink-0 w-72 sm:w-80 reveal-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#2A2C2F]/80 text-white rounded-full flex items-center justify-center hover:bg-[#F5B800] hover:text-black transition-colors shadow-xl z-10"
            aria-label="Cuộn phải"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
