"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Tag, Gift, Copy, Check, ArrowRight, ShieldCheck, Clock, Flame, Percent } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useCart, useToast } from "@/store/cartContext";

export interface PromotionItemData {
  id: string;
  tag: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  code?: string | null;
  discountValue?: string | null;
  minOrder?: string | null;
  giftText?: string | null;
  ctaText?: string | null;
  targetUrl?: string | null;
  imageUrl: string;
  originalPrice?: number | null;
  salePrice?: number | null;
  floatingPerks?: string[] | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

interface PromotionsPageClientProps {
  promotions: PromotionItemData[];
  products: Product[];
}

const DEFAULT_VOUCHERS = [
  {
    code: "BALOVIET20",
    discount: "20% OFF",
    minOrder: "Cho đơn từ 499k",
    expire: "Còn 5 ngày",
    category: "Voucher Hot",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    code: "FREESHIP50K",
    discount: "Miễn Phí Vận Chuyển",
    minOrder: "Cho đơn từ 299k",
    expire: "Còn 12 ngày",
    category: "Freeship",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    code: "VALICABIN100",
    discount: "Giảm 100.000₫",
    minOrder: "Áp dụng Balo Du Lịch 45L",
    expire: "Còn 3 ngày",
    category: "Độc Quyền",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    code: "BACK2SCHOOL",
    discount: "Tặng Túi Chống Nước",
    minOrder: "Cho đơn từ 650k",
    expire: "Còn 8 ngày",
    category: "Quà Tặng",
    gradient: "from-purple-500 to-indigo-600",
  },
];

export default function PromotionsPageClient({
  promotions = [],
  products = [],
}: PromotionsPageClientProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { addItem } = useCart();
  const { addToast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Đã sao chép mã ưu đãi: "${code}"`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const color = product.colors?.[0] || { name: "Đen", hex: "#000000" };
    addItem(product, 1, color.name, color.hex);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const filteredPromotions = useMemo(() => {
    if (activeTab === "all") return promotions;
    if (activeTab === "voucher") return promotions.filter((p) => p.code);
    if (activeTab === "gift") return promotions.filter((p) => p.giftText || p.badge?.includes("Quà"));
    if (activeTab === "discount") return promotions.filter((p) => p.salePrice || p.discountValue);
    return promotions;
  }, [promotions, activeTab]);

  return (
    <div className="bg-[#090A0B] min-h-screen text-white font-sans selection:bg-[#F5B800] selection:text-black">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#14161A] via-[#0D0E11] to-[#090A0B] pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>Siêu Bão Ưu Đãi & Khuyến Mãi Balo Việt</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-[1.1]">
            Săn Mã Giảm Giá & <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">Deal Khủng Mỗi Ngày</span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto font-normal">
            Tổng hợp tất cả mã voucher giảm giá, chương trình khuyến mãi độc quyền và quà tặng kèm cao cấp dành riêng cho khách hàng Balo Việt.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-gray-300 text-xs sm:text-sm font-mono">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{promotions.length} Chương trình đang diễn ra</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Giảm đến 50% sản phẩm hot</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Bảo hành chính hãng 10 năm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VOUCHER WALLET (MÃ GIẢM GIÁ NHANH) */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Tag className="w-4 h-4" />
              <span>Voucher Wallet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-1">
              Mã giảm giá hot nhất
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono hidden sm:block">Chỉ cần bấm để sao chép</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_VOUCHERS.map((v) => {
            const isCopied = copiedCode === v.code;

            return (
              <div
                key={v.code}
                className="bg-[#121418] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg group flex flex-col justify-between"
              >
                {/* Top Badge Accent */}
                <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-l ${v.gradient} text-white font-mono font-bold text-[10px] uppercase rounded-bl-xl shadow-md`}>
                  {v.category}
                </div>

                <div className="space-y-3">
                  <div className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {v.discount}
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{v.minOrder}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="bg-[#1A1D24] border border-dashed border-gray-600 px-3 py-1.5 rounded-lg text-amber-400 font-mono font-bold text-xs tracking-wider">
                    {v.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(v.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-200 flex items-center gap-1.5 ${
                      isCopied
                        ? "bg-emerald-500 text-black"
                        : "bg-amber-400 hover:bg-amber-300 text-black shadow-md"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Lấy mã</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CAMPAIGN PROMOTIONS GRID */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
              DANH SÁCH CHƯƠNG TRÌNH
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mt-1">
              Khuyến mãi đang diễn ra
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Tất cả ưu đãi" },
              { id: "voucher", label: "Có mã giảm" },
              { id: "gift", label: "Quà tặng kèm" },
              { id: "discount", label: "Giảm giá sâu" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-black shadow-md"
                    : "bg-[#14161A] text-gray-400 hover:text-white hover:bg-[#1C1F26]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Promotions Grid */}
        {filteredPromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPromotions.map((promo) => {
              const isCopied = copiedCode === promo.code;

              return (
                <article
                  key={promo.id}
                  className="bg-[#121418] border border-white/10 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Image Showcase Banner */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-900">
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                      />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          {promo.badge || promo.tag}
                        </span>
                      </div>

                      {promo.discountValue && (
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-mono font-black text-xs uppercase shadow-lg">
                          {promo.discountValue}
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-amber-400 tracking-wider">
                          {promo.tag}
                        </span>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mt-1 line-clamp-2 group-hover:text-amber-400 transition-colors">
                          {promo.title}
                        </h3>
                        <p className="text-amber-300/90 text-xs font-semibold mt-1">
                          {promo.highlight}
                        </p>
                      </div>

                      <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed font-sans">
                        {promo.description}
                      </p>

                      {/* Perks */}
                      {promo.floatingPerks && promo.floatingPerks.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {promo.floatingPerks.map((perk, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-[#1A1D24] text-gray-300 px-2.5 py-1 rounded-lg border border-white/5"
                            >
                              ✓ {perk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA & Voucher action */}
                  <div className="p-6 pt-0 space-y-3">
                    {promo.code && (
                      <div className="bg-[#181B22] border border-dashed border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">Mã ưu đãi:</span>
                          <span className="text-amber-400 font-mono font-bold text-sm">{promo.code}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(promo.code!)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isCopied ? "bg-emerald-500 text-black" : "bg-amber-400 hover:bg-amber-300 text-black"
                          }`}
                        >
                          {isCopied ? "Đã chép" : "Sao chép"}
                        </button>
                      </div>
                    )}

                    <Link
                      href={`/uu-dai/${promo.id}`}
                      className="w-full py-3 rounded-xl bg-[#1D2027] hover:bg-amber-400 text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md"
                    >
                      <span>{promo.ctaText || "Xem Chi Tiết Ưu Đãi"}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#121418] rounded-3xl border border-white/5 max-w-md mx-auto p-8">
            <p className="text-gray-400 text-sm">Chưa có chương trình ưu đãi nào trong danh mục này.</p>
          </div>
        )}
      </section>

      {/* 4. DEAL PRODUCTS APPLICABLE */}
      {products.length > 0 && (
        <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              SẢN PHẨM KHUYẾN MÃI NỔI BẬT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mt-1">
              Top sản phẩm áp dụng ưu đãi
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              Balo cao cấp giá ưu đãi đặc biệt — số lượng có hạn!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 8).map((product) => (
              <article
                key={product.id}
                className="bg-[#121418] border border-white/5 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg group"
              >
                <div>
                  <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square overflow-hidden rounded-xl bg-black/40 p-2">
                    <img
                      src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=350&h=350&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="mt-3">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">{product.category}</span>
                    <Link href={`/san-pham/${product.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 hover:text-amber-400 transition-colors">
                        {product.name}
                      </h4>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-400">{formatPrice(product.salePrice ?? product.price)}</span>
                      {product.salePrice && (
                        <span className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(product, e)}
                  className="mt-3 w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Thêm giỏ
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
