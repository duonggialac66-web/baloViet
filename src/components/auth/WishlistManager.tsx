"use client";

import React, { useState, useEffect } from "react";
import { useToast, useCart } from "@/store/cartContext";
import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import Rating from "@/components/Rating";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  category: string;
  categorySlug: string;
  stock: number;
  rating: number;
  reviews: number;
  shortDescription: string;
  description: string;
  specifications: any;
  tags: string[] | null;
  colors: { name: string; hex: string }[] | null;
  imageIds: string[] | null;
  imageAlts: string[] | null;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export default function WishlistManager() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToast } = useToast();
  const { addItem } = useCart();

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Không thể tải danh sách yêu thích", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`/api/user/wishlist/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("Đã xóa khỏi danh sách yêu thích", "success");
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      } else {
        const data = await res.json();
        addToast(data.error || "Không thể xóa sản phẩm", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Lỗi kết nối", "error");
    }
  };

  const handleAddToCart = (product: Product) => {
    const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : { name: "Mặc định", hex: "#888" };
    
    // Map to CartContext expected static Product structure
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      category: product.category,
      categorySlug: product.categorySlug,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
      shortDescription: product.shortDescription,
      description: product.description,
      specifications: product.specifications || {},
      tags: product.tags || [],
      images: product.imageIds?.map((id, index) => ({
        url: "", // handled by CloudinaryImage in cart items representation
        alt: product.imageAlts?.[index] || product.name,
        thumbnail: ""
      })) || [],
      colors: product.colors || [],
    };

    addItem(cartProduct, 1, selectedColor.name, selectedColor.hex);
    addToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-tight">
          Sản phẩm yêu thích
        </h1>
        <div className="w-12 h-1 bg-brand-gold mt-2" />
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-brand-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-brand-muted/20 border border-brand-border rounded-lg p-16 text-center text-brand-subdued font-body text-sm">
          Danh sách yêu thích trống.
          <div className="mt-4">
            <Link
              href="/san-pham"
              className="inline-flex bg-brand-gold text-black font-display font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded hover:bg-white transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
          {items.map(({ product }) => {
            const displayPrice = product.salePrice ?? product.price;
            const hasDiscount = !!product.salePrice;
            const imageId = product.imageIds && product.imageIds.length > 0 ? product.imageIds[0] : null;

            return (
              <div
                key={product.id}
                className="bg-brand-muted/10 border border-brand-border hover:border-brand-gold/40 rounded-lg overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1"
              >
                {/* Product Image section */}
                <div className="relative aspect-square bg-brand-muted overflow-hidden">
                  {imageId ? (
                    <CloudinaryImage
                      publicId={imageId}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🎒</div>
                  )}

                  {/* Remove button overlay */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-brand-gold hover:text-black p-2 rounded-full text-white transition-colors z-10"
                    aria-label="Xóa khỏi danh sách yêu thích"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-body font-bold text-brand-gold uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="font-display font-bold text-white text-base hover:text-brand-gold line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-1">
                      <Rating value={product.rating} size="sm" />
                      <span className="text-[10px] font-body text-brand-subdued">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Prices */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-body text-sm font-bold text-brand-gold">
                        {formatPrice(displayPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="font-body text-xs text-brand-subdued line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Add to cart button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-brand-muted border border-brand-border hover:border-brand-gold hover:text-black hover:bg-brand-gold py-2 rounded text-xs font-display font-bold uppercase tracking-widest text-white transition-all duration-300"
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
