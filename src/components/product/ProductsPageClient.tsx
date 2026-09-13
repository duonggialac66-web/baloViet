"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import ProductsHeroBanner, { type CategoryData } from "./ProductsHeroBanner";
import HotDealsCarousel, { type PromotionItem } from "./HotDealsCarousel";
import { useCart, useToast } from "@/store/cartContext";

interface ProductsPageClientProps {
  products: Product[];
  categories: CategoryData[];
  promotions?: PromotionItem[];
}

export default function ProductsPageClient({
  products,
  categories,
  promotions = [],
}: ProductsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    [products[1]?.id || ""]: true,
  });

  const { addItem } = useCart();
  const { addToast } = useToast();

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const color = product.colors?.[0] || { name: "Đen", hex: "#000000" };
    addItem(product, 1, color.name, color.hex);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const featuredProduct = useMemo(() => {
    return products.find((p) => p.isBestSeller) || products[0];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeCategory !== "all") {
      list = list.filter((p) => p.categorySlug === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="bg-[#090A0B] min-h-screen text-white">
      {/* 1. HERO BANNER */}
      <ProductsHeroBanner
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        featuredProduct={featuredProduct}
        totalProductsCount={products.length}
      />

      {/* 2. HOT DEALS CAROUSEL */}
      <HotDealsCarousel products={products} promotions={promotions} />

      {/* 3. PRODUCT CATALOG GRID */}
      <section id="brows-latest-products" className="py-20 sm:py-28 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight font-bold">
            Sản phẩm mới nhất
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto font-sans">
            Thiết kế tinh tế, chất liệu cao cấp — đồng hành cùng bạn mỗi ngày
          </p>

          {/* Search Input */}
          <div className="mt-6 max-w-sm mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121316] border border-[#222428] rounded-full px-5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B800] transition-colors text-center font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
            {filteredProducts.map((product, idx) => {
              const isFav = favorites[product.id] ?? idx === 1;

              return (
                <article
                  key={product.id}
                  className="group bg-[#121316] border border-white/5 hover:border-[#F5B800]/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between"
                >
                  {/* Top Image Showcase */}
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="block relative p-8 aspect-square flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=350&h=350&fit=crop&q=75"
                      }
                      alt={product.name}
                      width={350}
                      height={350}
                      decoding="async"
                      className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_20px_30px_rgba(0,0,0,0.85)]"
                      loading="lazy"
                    />
                  </Link>

                  {/* Card Bottom */}
                  <div className="p-6 pt-0 flex flex-col items-center text-center">
                    {/* Centered Wishlist Heart Circle */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="w-10 h-10 rounded-full bg-[#1A1C20] hover:bg-[#25282E] flex items-center justify-center transition-all duration-300 shadow-md mb-3 hover:scale-110 active:scale-90"
                      aria-label="Wishlist"
                    >
                      <svg
                        className="w-5 h-5 transition-colors"
                        viewBox="0 0 24 24"
                        fill={isFav ? "#F5B800" : "none"}
                        stroke={isFav ? "#F5B800" : "#8E9299"}
                        strokeWidth="1.75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </button>

                    {/* Product Name */}
                    <Link href={`/san-pham/${product.slug}`} className="block">
                      <h3 className="font-sans font-bold text-white text-sm sm:text-base tracking-wide hover:text-[#F5B800] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-sans text-sm text-[#F5B800] font-bold">
                        {formatPrice(product.salePrice ?? product.price)}
                      </span>
                      {product.salePrice && (
                        <span className="text-[11px] text-gray-500 line-through font-sans">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Hover Buy Action */}
                    <div className="mt-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="w-full py-2.5 rounded-xl bg-[#F5B800] hover:bg-[#E5AB00] text-[#0B0D0E] font-sans text-xs uppercase tracking-wider transition-all duration-300 font-bold shadow-[0_0_20px_rgba(245,184,0,0.3)]"
                      >
                        Thêm vào giỏ hàng
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#121316] rounded-3xl border border-white/5 max-w-md mx-auto px-6">
            <p className="font-sans text-gray-400 text-sm">
              Không tìm thấy sản phẩm phù hợp.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#F5B800] text-[#0B0D0E] text-xs font-sans tracking-wider uppercase font-bold"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
