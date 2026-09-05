"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useCart } from "@/store/cartContext";
import { useToast } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";
import Rating from "./Rating";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || { name: "Đen", hex: "#000000" });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, selectedColor.name, selectedColor.hex);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const isFeatured = variant === "featured";

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    try {
      if (isFavorite) {
        await fetch(`/api/user/wishlist?productId=${product.id}`, { method: "DELETE" });
        addToast(`Đã xóa "${product.name}" khỏi mục yêu thích`);
      } else {
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id })
        });
        addToast(`Đã thêm "${product.name}" vào mục yêu thích`);
      }
    } catch (error) {
      console.error("Wishlist toggle error", error);
    }
  };

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 border border-gray-200/80 hover:border-[#F5B800]/60 rounded-xl sm:rounded-2xl flex flex-col h-full select-none"
    >
      {/* Badges Top-Left */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1 sm:gap-1.5 items-start pointer-events-none">
        {product.isBestSeller && (
          <span className="bg-[#F5B800] text-black text-[8px] sm:text-[10px] font-display font-black tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase rounded sm:rounded-lg shadow-md flex items-center gap-0.5 sm:gap-1">
            <span>🔥</span>
            <span className="hidden xs:inline">Bán chạy</span>
          </span>
        )}
        {product.isNew && (
          <span className="bg-[#0B0D0E] text-white text-[8px] sm:text-[10px] font-display font-bold tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase rounded sm:rounded-lg shadow-md flex items-center gap-0.5 sm:gap-1">
            <span>⚡</span>
            <span className="hidden xs:inline">Mới</span>
          </span>
        )}
        {discount && (
          <span className="bg-red-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded sm:rounded-lg shadow-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Wishlist Top-Right */}
      {isAuthenticated && (
        <button 
          onClick={toggleFavorite}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-md hover:scale-110 active:scale-95"
          aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill={isFavorite ? "#EF4444" : "none"} stroke={isFavorite ? "#EF4444" : "currentColor"} strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      )}

      {/* Product Image Section */}
      <Link href={`/san-pham/${product.slug}`} className="block relative overflow-hidden bg-[#F9FAFB]" aria-label={product.name}>
        <div className={`relative w-full flex items-center justify-center p-2.5 sm:p-5 ${isFeatured ? "aspect-[4/3] sm:aspect-square" : "aspect-square"}`}>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#E5E7EB] animate-pulse" />
          )}
          <img
            src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"}
            alt={product.images?.[0]?.alt || product.name}
            className={`w-[90%] h-[90%] object-contain transition-all duration-700 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          {/* Hover second image */}
          {product.images?.[1] && (
            <img
              src={product.images[1].url}
              alt={`${product.name} - góc nhìn khác`}
              className="absolute inset-0 w-full h-full object-contain p-2.5 sm:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[#F9FAFB]"
              loading="lazy"
            />
          )}

          {/* Quick View Tag on Hover */}
          <div className="hidden sm:block absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="bg-[#0B0D0E]/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
              Xem chi tiết
            </span>
          </div>
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between relative bg-white">
        <div>
          {/* Category Pill */}
          <div className="text-[9px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1 line-clamp-1">
            {product.category || "Balo"}
          </div>

          {/* Product Name */}
          <Link href={`/san-pham/${product.slug}`}>
            <h3 className="font-sans font-bold text-gray-900 text-xs sm:text-sm md:text-[15px] leading-snug hover:text-amber-600 transition-colors line-clamp-2 mb-1.5 sm:mb-2 tracking-normal">
              {product.name}
            </h3>
          </Link>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-1 mb-2 sm:mb-3 text-[#F5B800] text-xs">
            <Rating value={product.rating ?? 4.8} count={0} size="sm" />
            <span className="text-[#6B7280] text-[10px] sm:text-xs font-semibold ml-0.5">({product.reviews ?? 0})</span>
          </div>
        </div>

        <div>
          {/* Color Switcher Dots if present */}
          {product.colors && product.colors.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 mb-2.5">
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(c);
                  }}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all ${
                    selectedColor.hex === c.hex
                      ? "ring-2 ring-[#F5B800] ring-offset-1 scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={`Màu ${c.name}`}
                />
              ))}
              <span className="text-[10px] text-gray-400 ml-1 font-medium">{selectedColor.name}</span>
            </div>
          )}

          {/* Price & Add to Cart Button */}
          <div className="flex items-end justify-between pt-1.5 sm:pt-2 border-t border-gray-100">
            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-[#0B0D0E] text-xs sm:text-base md:text-lg truncate">
                  {formatPrice(product.salePrice ?? product.price)}
                </span>
              </div>
              {product.salePrice && (
                <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-[#9CA3AF] line-through truncate">
                  <span>{formatPrice(product.price)}</span>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#0B0D0E] text-[#F5B800] hover:bg-[#F5B800] hover:text-black flex items-center justify-center transition-all duration-300 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed shadow-sm hover:scale-110 active:scale-95 shrink-0"
              aria-label="Thêm vào giỏ"
              title={product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
            >
              {product.stock === 0 ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.93 4.93l14.14 14.14" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
