"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useCart, useToast } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";
import Rating from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
}

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || { name: "Đen", hex: "#000000" });
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "spec" | "warranty" | "reviews">("desc");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Zoom magnifier
  const [zoomStyle, setZoomStyle] = useState<{ display: string; backgroundPosition?: string }>({ display: "none" });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop", alt: product.name, thumbnail: "" }];

  const currentImage = images[selectedImageIndex] || images[0];

  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : null;

  const savings = product.salePrice
    ? product.price - product.salePrice
    : 0;

  // Handle Zoom on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem(product, quantity, selectedColor.name, selectedColor.hex);
    addToast(`Đã thêm ${quantity} x "${product.name}" (${selectedColor.name}) vào giỏ hàng`);
  };

  // Buy Now
  const handleBuyNow = () => {
    if (product.stock === 0) return;
    addItem(product, quantity, selectedColor.name, selectedColor.hex);
    router.push("/thanh-toan");
  };

  // Toggle Favorite
  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    try {
      if (isFavorite) {
        await fetch(`/api/user/wishlist?productId=${product.id}`, { method: "DELETE" });
        addToast(`Đã xóa "${product.name}" khỏi danh sách yêu thích`);
      } else {
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        addToast(`Đã thêm "${product.name}" vào danh sách yêu thích`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy voucher
  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast(`Đã sao chép mã giảm giá: ${code}`);
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast("Vui lòng đăng nhập để gửi đánh giá!");
      router.push(`/dang-nhap?redirect=/san-pham/${product.slug}`);
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          content: reviewContent,
        }),
      });

      if (res.ok) {
        setReviewSubmitted(true);
        setReviewTitle("");
        setReviewContent("");
        addToast("Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.");
      } else {
        addToast("Không thể gửi đánh giá. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Review error:", err);
      addToast("Đã xảy ra lỗi gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/san-pham" },
    { label: product.category || "Balo", href: `/danh-muc/${product.categorySlug || ""}` },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D0E] text-white pt-20 pb-24">
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={currentImage.url}
            alt={currentImage.alt}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-fadeup"
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[#F5B800] p-2 bg-black/50 rounded-full"
            aria-label="Đóng xem ảnh lớn"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* ======================================================= */}
        {/* TOP SECTION: MEDIA GALLERY + PRODUCT PURCHASE CONFIG    */}
        {/* ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* --- LEFT: PRODUCT MEDIA GALLERY (7 Cols) --- */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Main Stage Image */}
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-square bg-[#161819] rounded-3xl border border-[#2A2C2F] overflow-hidden flex items-center justify-center p-6 sm:p-10 cursor-zoom-in group shadow-2xl"
            >
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {product.isBestSeller && (
                  <span className="bg-[#F5B800] text-black text-xs font-display font-black tracking-wider px-3 py-1 uppercase rounded-lg shadow-md flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>Bán chạy nhất</span>
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-white text-black text-xs font-display font-bold tracking-wider px-3 py-1 uppercase rounded-lg shadow-md flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Mẫu mới 2026</span>
                  </span>
                )}
                {discount && (
                  <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite();
                  }}
                  className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-black transition-all shadow-lg hover:scale-110 active:scale-95"
                  aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isFavorite ? "#EF4444" : "none"} stroke={isFavorite ? "#EF4444" : "currentColor"} strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              )}

              {/* Main Image */}
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />

              {/* Zoom Lens Indicator */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 text-xs text-gray-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                <span>Nhấn để phóng to</span>
              </div>

              {/* Quick Tech Highlight Pills Overlay */}
              <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 pointer-events-none">
                <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-gray-300 px-2.5 py-1 rounded-lg">
                  🛡️ Chống sốc 360°
                </span>
                <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-gray-300 px-2.5 py-1 rounded-lg">
                  💧 Kháng nước IPX7
                </span>
              </div>
            </div>

            {/* Thumbnails Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative shrink-0 w-20 sm:w-24 aspect-square rounded-2xl overflow-hidden bg-[#161819] border-2 transition-all duration-200 p-2 ${
                      selectedImageIndex === idx
                        ? "border-[#F5B800] ring-2 ring-[#F5B800]/30 scale-105"
                        : "border-[#2A2C2F] opacity-70 hover:opacity-100 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${product.name} góc ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: PRODUCT PURCHASE INFO (5 Cols) --- */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & SKU code */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <Link
                  href={`/danh-muc/${product.categorySlug || ""}`}
                  className="text-xs font-bold text-[#F5B800] uppercase tracking-wider hover:underline"
                >
                  {product.category || "Balo Cao Cấp"}
                </Link>
                <span className="text-xs font-mono text-gray-400">
                  MÃ: <span className="text-gray-200">{product.sku}</span>
                </span>
              </div>

              {/* Product Title */}
              <h1 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Star Rating & Reviews Link */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#2A2C2F]">
                <div className="flex items-center gap-1.5 text-[#F5B800]">
                  <Rating value={product.rating ?? 4.9} count={0} size="md" />
                  <span className="font-bold text-white text-sm ml-1">
                    {(product.rating ?? 4.9).toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600">•</span>
                <button
                  onClick={() => {
                    setActiveTab("reviews");
                    const el = document.getElementById("product-tabs");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs sm:text-sm text-gray-400 hover:text-[#F5B800] transition-colors underline-offset-4 hover:underline"
                >
                  {product.reviews ?? 0} đánh giá từ khách hàng
                </button>
              </div>

              {/* Price Block */}
              <div className="bg-[#161819] rounded-2xl p-5 border border-[#2A2C2F] mb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-display font-black text-3xl sm:text-4xl text-[#F5B800]">
                    {formatPrice(product.salePrice ?? product.price)}
                  </span>
                  {product.salePrice && (
                    <span className="text-gray-500 text-base sm:text-lg line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                      Tiết kiệm {formatPrice(savings)}
                    </span>
                  )}
                </div>

                {/* Stock status */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Còn hàng ({product.stock} sản phẩm sẵn sàng giao)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Tạm hết hàng</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Swatch Picker */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Màu sắc: <span className="text-[#F5B800]">{selectedColor.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                          selectedColor.hex === color.hex
                            ? "ring-2 ring-[#F5B800] ring-offset-2 ring-offset-[#0B0D0E] scale-110"
                            : "opacity-75 hover:opacity-100 hover:scale-105"
                        }`}
                        title={color.name}
                        aria-label={`Chọn màu ${color.name}`}
                      >
                        <span
                          className="w-8 h-8 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
                  Số lượng:
                </label>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center bg-[#161819] border border-[#2A2C2F] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-11 h-11 flex items-center justify-center text-gray-300 hover:bg-[#2A2C2F] hover:text-white disabled:opacity-40 transition-colors text-lg"
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                      disabled={quantity >= product.stock}
                      className="w-11 h-11 flex items-center justify-center text-gray-300 hover:bg-[#2A2C2F] hover:text-white disabled:opacity-40 transition-colors text-lg"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-gray-500">
                    Tổng tiền: <strong className="text-white font-bold">{formatPrice((product.salePrice ?? product.price) * quantity)}</strong>
                  </span>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#1E2022] hover:bg-[#2A2C2F] border border-white/10 text-white font-display font-bold text-sm uppercase tracking-wider hover:border-[#F5B800] hover:text-[#F5B800] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Thêm vào giỏ</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F5B800] to-amber-400 hover:from-white hover:to-white text-black font-display font-black text-sm uppercase tracking-wider shadow-xl shadow-[#F5B800]/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>MUA NGAY</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7M3 12h18" />
                  </svg>
                </button>
              </div>

              {/* Promo Vouchers Coupon Box */}
              <div className="bg-[#161819] rounded-2xl p-4 border border-[#2A2C2F] mb-6 space-y-2.5">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎟️</span>
                  <span>MÃ ƯU ĐÃI DÀNH CHO BẠN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-[#0B0D0E] p-2.5 rounded-xl border border-dashed border-[#F5B800]/40">
                    <div>
                      <p className="font-mono font-bold text-xs text-[#F5B800]">BALO50K</p>
                      <p className="text-[10px] text-gray-400">Giảm 50K đơn từ 500K</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyVoucher("BALO50K")}
                      className="text-[10px] bg-[#F5B800] text-black font-bold px-2 py-1 rounded-md hover:bg-white transition-colors"
                    >
                      Lưu mã
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-[#0B0D0E] p-2.5 rounded-xl border border-dashed border-[#F5B800]/40">
                    <div>
                      <p className="font-mono font-bold text-xs text-[#F5B800]">FREESHIP</p>
                      <p className="text-[10px] text-gray-400">Miễn phí ship toàn quốc</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyVoucher("FREESHIP")}
                      className="text-[10px] bg-[#F5B800] text-black font-bold px-2 py-1 rounded-md hover:bg-white transition-colors"
                    >
                      Lưu mã
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Policy Perks */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-base text-[#F5B800]">🛡️</span>
                  <span>Bảo hành 24 tháng chính hãng</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-base text-blue-400">🚚</span>
                  <span>Giao nhanh 2H nội thành</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-base text-green-400">🔄</span>
                  <span>14 ngày đổi trả miễn phí</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-base text-purple-400">📦</span>
                  <span>Đồng kiểm khi nhận hàng</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ======================================================= */}
        {/* TABS SECTION: DESCRIPTION, SPECS, WARRANTY, REVIEWS     */}
        {/* ======================================================= */}
        <div id="product-tabs" className="mb-20 pt-8 border-t border-[#2A2C2F]">
          
          {/* Tab Navigation Header */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 border-b border-[#2A2C2F] scrollbar-hide">
            {[
              { key: "desc", label: "Mô Tả & Công Nghệ", icon: "✨" },
              { key: "spec", label: "Thông Số Kỹ Thuật", icon: "📐" },
              { key: "warranty", label: "Chính Sách Bảo Hành", icon: "🛡️" },
              { key: "reviews", label: `Đánh Giá (${product.reviews ?? 0})`, icon: "⭐" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-[#F5B800] text-black shadow-lg shadow-[#F5B800]/20 scale-105"
                    : "bg-[#161819] text-gray-400 hover:text-white hover:bg-[#1E2022] border border-[#2A2C2F]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="pt-8">
            {/* TAB 1: DESCRIPTION */}
            {activeTab === "desc" && (
              <div className="space-y-8 animate-fadeup">
                <div className="bg-[#161819] rounded-3xl p-6 sm:p-10 border border-[#2A2C2F]">
                  <h3 className="font-display font-black text-2xl uppercase tracking-wider text-white mb-4">
                    Tổng quan sản phẩm
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line mb-8">
                    {product.description || product.shortDescription}
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#2A2C2F]">
                    <div className="bg-[#0B0D0E] p-6 rounded-2xl border border-white/5 space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-[#F5B800]/15 text-[#F5B800] flex items-center justify-center text-2xl">
                        🛡️
                      </div>
                      <h4 className="font-bold text-white text-base">Đệm chống sốc 360°</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Cấu trúc tổ ong mật độ cao bao bọc ngăn laptop và đáy balo, hấp thụ toàn bộ lực va đập khi di chuyển.
                      </p>
                    </div>

                    <div className="bg-[#0B0D0E] p-6 rounded-2xl border border-white/5 space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center text-2xl">
                        💧
                      </div>
                      <h4 className="font-bold text-white text-base">Kháng nước IPX7</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Chất liệu TPU tráng phủ nano phối hợp khóa kéo cao su kín nước, an toàn tuyệt đối dưới mưa bão.
                      </p>
                    </div>

                    <div className="bg-[#0B0D0E] p-6 rounded-2xl border border-white/5 space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-2xl">
                        ⚡
                      </div>
                      <h4 className="font-bold text-white text-base">Cổng sạc USB-C Smart</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Tích hợp cổng kết nối sạc nhanh ẩn bên hông giúp bạn nạp năng lượng cho điện thoại mọi lúc mọi nơi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPECIFICATIONS */}
            {activeTab === "spec" && (
              <div className="bg-[#161819] rounded-3xl p-6 sm:p-10 border border-[#2A2C2F] animate-fadeup">
                <h3 className="font-display font-black text-2xl uppercase tracking-wider text-white mb-6">
                  Bảng thông số kỹ thuật chi tiết
                </h3>

                <div className="divide-y divide-[#2A2C2F]">
                  {[
                    { label: "Mã sản phẩm (SKU)", value: product.sku },
                    { label: "Dòng sản phẩm", value: product.category || "Balo Cao Cấp" },
                    { label: "Kích thước tương thích", value: product.specifications?.["Kích thước"] || "45 x 30 x 15 cm" },
                    { label: "Dung tích", value: product.specifications?.["Dung tích"] || "25 - 35 Lít" },
                    { label: "Trọng lượng", value: product.specifications?.["Trọng lượng"] || "0.85 kg" },
                    { label: "Chất liệu chính", value: product.specifications?.["Chất liệu"] || "Vải Cordura 1000D + TPU chống thấm" },
                    { label: "Ngăn đựng Laptop", value: product.specifications?.["Ngăn Laptop"] || "Tối đa 15.6 - 17.3 inch đệm tổ ong" },
                    { label: "Khóa kéo", value: product.specifications?.["Khóa kéo"] || "YKK chống rạch, khóa kim loại cao cấp" },
                    { label: "Chống nước", value: product.specifications?.["Kháng nước"] || "Tiêu chuẩn IPX7 kháng nước toàn diện" },
                    { label: "Xuất xứ & Bảo hành", value: "Việt Nam • Bảo hành 24 tháng chính hãng" },
                  ].map((spec, i) => (
                    <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <span className="text-gray-400 font-medium">{spec.label}</span>
                      <span className="text-white font-bold sm:text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WARRANTY & RETURNS */}
            {activeTab === "warranty" && (
              <div className="bg-[#161819] rounded-3xl p-6 sm:p-10 border border-[#2A2C2F] space-y-6 animate-fadeup">
                <h3 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                  Chính sách bảo hành & Đổi trả độc quyền
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0B0D0E] p-6 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="font-bold text-[#F5B800] text-lg flex items-center gap-2">
                      <span>🛡️</span> Bảo hành 24 Tháng 1 Đổi 1
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Bảo hành điện tử trên toàn hệ thống không cần giữ hóa đơn giấy. Bảo hành miễn phí toàn bộ các lỗi kỹ thuật như khóa kéo, đường chỉ may, quai đeo trong suốt 2 năm.
                    </p>
                  </div>

                  <div className="bg-[#0B0D0E] p-6 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="font-bold text-[#F5B800] text-lg flex items-center gap-2">
                      <span>🔄</span> 14 Ngày Đổi Mới Miễn Phí
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Đổi mới kích thước hoặc đổi sang mẫu khác hoàn toàn miễn phí trong vòng 14 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên tem mác.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="bg-[#161819] rounded-3xl p-6 sm:p-10 border border-[#2A2C2F] space-y-10 animate-fadeup">
                
                {/* Rating Overview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-8 border-b border-[#2A2C2F]">
                  <div className="md:col-span-4 text-center md:text-left border-r border-[#2A2C2F] pr-6">
                    <p className="text-5xl font-display font-black text-[#F5B800]">
                      {(product.rating ?? 4.9).toFixed(1)}
                    </p>
                    <div className="my-2 flex justify-center md:justify-start">
                      <Rating value={product.rating ?? 4.9} count={0} size="lg" />
                    </div>
                    <p className="text-xs text-gray-400">
                      Dựa trên {product.reviews ?? 0} đánh giá thực tế từ khách mua hàng
                    </p>
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    {[
                      { star: 5, pct: 85 },
                      { star: 4, pct: 12 },
                      { star: 3, pct: 2 },
                      { star: 2, pct: 1 },
                      { star: 1, pct: 0 },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-gray-400 font-medium">{row.star} sao</span>
                        <div className="flex-1 h-2 bg-[#0B0D0E] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#F5B800] rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-gray-400">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Review Form */}
                <div className="bg-[#0B0D0E] p-6 sm:p-8 rounded-2xl border border-white/5">
                  <h4 className="font-display font-bold text-lg text-white uppercase tracking-wider mb-4">
                    Gửi nhận xét của bạn
                  </h4>

                  {reviewSubmitted ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium">
                      ✓ Đánh giá của bạn đã được gửi thành công và đang chờ xét duyệt!
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                          Bạn đánh giá sản phẩm này bao nhiêu sao?
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="text-2xl text-[#F5B800] hover:scale-125 transition-transform"
                            >
                              {star <= reviewRating ? "★" : "☆"}
                            </button>
                          ))}
                          <span className="text-xs font-semibold text-[#F5B800] ml-2">
                            ({reviewRating} / 5 sao)
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                          Tiêu đề đánh giá
                        </label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Ví dụ: Balo rất đẹp, chống nước tốt"
                          required
                          className="w-full px-4 py-2.5 bg-[#161819] border border-[#2A2C2F] rounded-xl text-sm text-white focus:border-[#F5B800] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                          Nội dung đánh giá chi tiết
                        </label>
                        <textarea
                          rows={4}
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          placeholder="Chia sẻ cảm nhận về chất liệu, ngăn chứa, quai đeo..."
                          required
                          className="w-full px-4 py-2.5 bg-[#161819] border border-[#2A2C2F] rounded-xl text-sm text-white focus:border-[#F5B800] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-3 bg-[#F5B800] hover:bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* ======================================================= */}
        {/* RELATED PRODUCTS SECTION                                */}
        {/* ======================================================= */}
        {relatedProducts.length > 0 && (
          <ScrollReveal>
            <div className="pt-8 border-t border-[#2A2C2F]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
                    Sản phẩm cùng danh mục
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Khám phá thêm các mẫu balo chất lượng cao khác
                  </p>
                </div>

                <Link
                  href="/san-pham"
                  className="text-xs font-bold text-[#F5B800] uppercase tracking-wider hover:underline flex items-center gap-1.5"
                >
                  <span>Xem thêm</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {relatedProducts.slice(0, 4).map((item) => (
                  <div key={item.id} className="w-full">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>
    </div>
  );
}
