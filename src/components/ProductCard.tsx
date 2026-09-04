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
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
    <article className="group relative bg-[#F3F4F6] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent rounded-lg">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isBestSeller && (
          <span className="bg-[#F5B800] text-black text-[10px] font-display font-bold tracking-wider px-2 py-1 uppercase rounded-sm shadow-sm">
            Best Seller!
          </span>
        )}
        {product.isNew && (
          <span className="bg-white text-black text-[10px] font-display font-bold tracking-wider px-2 py-1 uppercase rounded-sm shadow-sm">
            Mới
          </span>
        )}
        {discount && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
            -{discount}%
          </span>
        )}
      </div>

      {isAuthenticated && (
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm"
          aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      )}

      {/* Image */}
      <Link href={`/san-pham/${product.slug}`} aria-label={product.name}>
        <div className={`relative bg-transparent overflow-hidden flex items-center justify-center p-4 ${isFeatured ? "aspect-[3/4]" : "aspect-square"}`}>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#E5E7EB] animate-pulse" />
          )}
          <img
            src={product.images[0].url}
            alt={product.images[0].alt}
            className={`w-[90%] h-[90%] object-contain transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          {/* Hover second image */}
          {product.images[1] && (
            <img
              src={product.images[1].url}
              alt={`${product.name} - góc nhìn khác`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 relative bg-white">
        {/* Name */}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="font-display font-bold text-[#0B0D0E] text-base leading-tight hover:text-[#F5B800] transition-colors line-clamp-1 uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2 mb-2">
          <span className="font-display font-bold text-[#F5B800] text-lg">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {product.salePrice && (
            <span className="text-[#9CA3AF] text-sm line-through decoration-[#9CA3AF]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4 text-[#F5B800]">
          <Rating value={product.rating} count={0} size="sm" />
          <span className="text-[#6B6E72] text-xs">({product.reviews})</span>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 mb-2 opacity-0 h-0 overflow-hidden pointer-events-none">
          {/* Colors disabled to match design cleaner look */}
        </div>

        {/* Add to Cart - Corner Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#F5B800] text-black flex items-center justify-center hover:bg-black hover:text-[#F5B800] hover:scale-110 transition-all duration-200 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:hover:scale-100 disabled:cursor-not-allowed group/btn shadow-md"
          aria-label="Thêm vào giỏ"
        >
          {product.stock === 0 ? (
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M18.36 6.64a9 9 0 11-12.73 12.73 9 9 0 0112.73-12.73zM12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
