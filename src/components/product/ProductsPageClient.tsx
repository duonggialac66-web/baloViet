"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(products);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1); // Assume 1 initially, or pass it from server if needed. For now, we'll fetch to get the real count.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    [products[1]?.id || ""]: true,
  });

  const { addItem } = useCart();
  const { addToast } = useToast();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Initial params
  useEffect(() => {
    const cat = searchParams?.get("category") || searchParams?.get("cat") || searchParams?.get("c");
    const q = searchParams?.get("q");
    if (cat) setActiveCategory(cat);
    if (q) setSearchQuery(q);
    setIsInitialized(true);
  }, [searchParams]);

  // Fetch logic
  const fetchProducts = async (currentPage: number, isReset: boolean) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery.trim());
      params.set("page", currentPage.toString());
      params.set("limit", "8");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      
      if (data.products) {
        setDisplayedProducts(prev => isReset ? data.products : [...prev, ...data.products]);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when category or search changes (after initial load)
  useEffect(() => {
    if (!isInitialized) return;
    
    // If it's the exact initial state (no search, no category filter) and page 1, 
    // we can just keep the SSR products. But to ensure totalPages is correct, 
    // it's safer to fetch or let the user click Load More. 
    // We'll fetch to get totalPages if filters change.
    setPage(1);
    fetchProducts(1, true);
  }, [activeCategory, debouncedSearchQuery, isInitialized]);

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

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  return (
    <div className="bg-[#090A0B] min-h-screen text-white">
      {/* 1. HERO BANNER */}
      <ProductsHeroBanner
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        featuredProduct={featuredProduct}
        totalProductsCount={products.length}
      />

      {/* 2. HOT DEALS CAROUSEL */}
      <HotDealsCarousel products={products} promotions={promotions} />

      {/* 3. PRODUCT CATALOG GRID */}
      <section id="brows-latest-products" className="py-12 sm:py-24 max-w-[1440px] mx-auto px-3 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-syne text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight font-bold">
            Sản phẩm mới nhất
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-lg mx-auto font-sans">
            Thiết kế tinh tế, chất liệu cao cấp — đồng hành cùng bạn mỗi ngày
          </p>

          {/* Search Input */}
          <div className="mt-5 max-w-sm mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121316] border border-[#222428] rounded-full px-4 py-2 text-xs sm:text-sm text-black placeholder-gray-500 focus:outline-none focus:border-[#F5B800] transition-colors text-center font-sans"
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

        {/* Product Grid — 2 items per row on mobile (grid-cols-2), 3 on tablet, 4 on desktop */}
        {displayedProducts.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {displayedProducts.map((product, idx) => {
                const isFav = favorites[product.id] ?? idx === 1;

                return (
                  <article
                    key={product.id}
                    className="group bg-[#121316] border border-white/5 hover:border-[#F5B800]/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    {/* Top Image Showcase */}
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="block relative p-3 sm:p-6 aspect-square flex items-center justify-center overflow-hidden"
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
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                        loading="lazy"
                      />
                    </Link>

                    {/* Card Bottom */}
                    <div className="p-3 sm:p-5 pt-0 flex flex-col items-center text-center">
                      {/* Centered Wishlist Heart Circle */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#1A1C20] hover:bg-[#25282E] flex items-center justify-center transition-all duration-300 shadow-md mb-2 hover:scale-110 active:scale-90"
                        aria-label="Wishlist"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors"
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
                      <Link href={`/san-pham/${product.slug}`} className="block w-full">
                        <h3 className="font-sans font-bold text-white text-xs sm:text-sm tracking-tight hover:text-[#F5B800] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="mt-1 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-sans text-xs sm:text-sm text-[#F5B800] font-bold">
                          {formatPrice(product.salePrice ?? product.price)}
                        </span>
                        {product.salePrice && (
                          <span className="text-[10px] text-gray-500 line-through font-sans hidden xs:inline">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      {/* Quick Add Button */}
                      <div className="mt-2.5 w-full">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-[#F5B800] hover:bg-[#E5AB00] text-[#0B0D0E] font-sans text-xs uppercase tracking-wider transition-all duration-300 font-bold shadow-[0_0_12px_rgba(245,184,0,0.25)]"
                        >
                          Thêm giỏ
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Load More Button (+8 items per click) */}
            {page < totalPages && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-[#F5B800] hover:bg-[#E5AB00] text-[#0B0D0E] font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(245,184,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <span>Xem thêm sản phẩm</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
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
