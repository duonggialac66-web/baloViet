"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Tag,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Gift,
  CheckCircle2,
  Share2,
  ShoppingBag,
} from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useCart, useToast } from "@/store/cartContext";
import type { PromotionItemData } from "./PromotionsPageClient";

interface PromotionDetailClientProps {
  promotion: PromotionItemData;
  applicableProducts: Product[];
  otherPromotions?: PromotionItemData[];
}

export default function PromotionDetailClient({
  promotion,
  applicableProducts = [],
  otherPromotions = [],
}: PromotionDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();

  const handleCopyCode = () => {
    if (!promotion.code) return;
    navigator.clipboard.writeText(promotion.code);
    setCopied(true);
    addToast(`Đã sao chép mã ưu đãi: "${promotion.code}"`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickAdd = (product: Product) => {
    const color = product.colors?.[0] || { name: "Đen", hex: "#000000" };
    addItem(product, 1, color.name, color.hex);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  return (
    <div className="bg-[#090A0B] min-h-screen text-white font-sans selection:bg-[#F5B800] selection:text-black">
      {/* 1. BREADCRUMB & BACK HEADER */}
      <section className="pt-24 sm:pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center justify-between">
          <Link
            href="/uu-dai"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả chương trình ưu đãi</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Cập nhật mới nhất</span>
          </div>
        </div>
      </section>

      {/* 2. MAIN PROMOTION SHOWCASE HERO */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: IMAGE SHOWCASE BANNER */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl group">
            <div className="aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden">
              <img
                src={promotion.imageUrl}
                alt={promotion.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-lg">
                  {promotion.badge || promotion.tag}
                </span>
              </div>

              {promotion.discountValue && (
                <div className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-mono font-black text-base uppercase shadow-xl">
                  {promotion.discountValue}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: PROMOTION DETAILS & CODE BOX */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider border border-amber-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{promotion.tag}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
                {promotion.title}
              </h1>

              <p className="text-amber-300 font-bold text-sm sm:text-base mt-2">
                {promotion.highlight}
              </p>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed font-sans">
              {promotion.description}
            </p>

            {/* PERKS BADGES */}
            {promotion.floatingPerks && promotion.floatingPerks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {promotion.floatingPerks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-[#14161A] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-gray-200 font-mono"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            )}

            {/* VOUCHER CODE ACTION BOX */}
            {promotion.code ? (
              <div className="bg-gradient-to-r from-[#181B22] to-[#121418] border-2 border-dashed border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>Mã giảm giá áp dụng</span>
                  </div>
                  {promotion.minOrder && (
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">
                      {promotion.minOrder}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-amber-400 tracking-wider">
                    {promotion.code}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg ${
                      copied
                        ? "bg-emerald-500 text-black scale-105"
                        : "bg-amber-400 hover:bg-amber-300 text-black hover:scale-105 active:scale-95"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã Sao Chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao Chép Mã</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  href={promotion.targetUrl || "/san-pham"}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Săn Ưu Đãi Ngay</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. TERMS & CONDITIONS SECTION */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="bg-[#121418] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Thể Lệ & Điều Khoản Áp Dụng</span>
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Áp dụng trực tiếp khi thanh toán trực tuyến hoặc mua hàng trực tiếp tại website Balo Việt.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>{promotion.minOrder ? promotion.minOrder : "Mỗi khách hàng được áp dụng mã giảm giá 1 lần duy nhất."}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Được áp dụng đồng thời với chính sách Miễn phí vận chuyển toàn quốc cho đơn hàng từ 499k.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Sản phẩm khuyến mãi vẫn áp dụng đầy đủ chính sách Đổi trả 30 ngày và Bảo hành chính hãng 10 năm.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 4. APPLICABLE PRODUCTS GRID */}
      {applicableProducts.length > 0 && (
        <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                DANH SÁCH ÁP DỤNG
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mt-1">
                Sản phẩm trong chương trình
              </h2>
            </div>

            <Link
              href="/san-pham"
              className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider font-mono"
            >
              Xem tất cả sản phẩm ↗
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {applicableProducts.map((product) => (
              <article
                key={product.id}
                className="bg-[#121418] border border-white/5 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg group"
              >
                <div>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="block relative aspect-square overflow-hidden rounded-xl bg-black/40 p-2"
                  >
                    <img
                      src={
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=350&h=350&fit=crop"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="mt-3">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      {product.category}
                    </span>
                    <Link href={`/san-pham/${product.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 hover:text-amber-400 transition-colors">
                        {product.name}
                      </h4>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-400">
                        {formatPrice(product.salePrice ?? product.price)}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(product)}
                  className="mt-3 w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Thêm giỏ
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 5. OTHER PROMOTIONS CAROUSEL / LIST */}
      {otherPromotions.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6">
            Các chương trình ưu đãi khác
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPromotions.map((p) => (
              <Link
                key={p.id}
                href={`/uu-dai/${p.id}`}
                className="bg-[#121418] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex gap-4 items-center group transition-all"
              >
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">{p.tag}</span>
                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{p.highlight}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
