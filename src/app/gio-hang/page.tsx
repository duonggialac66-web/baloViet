"use client";

import { useState } from "react";
import { useCart, useToast } from "@/store/cartContext";
import { formatPrice } from "@/data/products";
import Link from "next/link";

export default function GioHangPage() {
  const { items, totalPrice, coupon, discountAmount, applyCoupon, removeCoupon, removeItem, updateQty, clear } = useCart();
  const { addToast } = useToast();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const targetCode = codeToApply || couponInput;
    if (!targetCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const result = await applyCoupon(targetCode);
    setCouponLoading(false);
    if (result.success) {
      addToast(result.message, "success");
      setCouponInput("");
    } else {
      setCouponError(result.message);
      addToast(result.message, "error");
    }
  };

  const baseShippingFee = totalPrice >= 1000000 || totalPrice === 0 ? 0 : 30000;
  const shippingFee = coupon?.discountType === "freeship" ? 0 : baseShippingFee;
  const effectiveDiscount = coupon?.discountType === "freeship" ? baseShippingFee : discountAmount;
  const totalAmount = Math.max(0, totalPrice + shippingFee - (coupon?.discountType === "freeship" ? 0 : discountAmount));

  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <h1 className="font-display font-black text-white text-4xl lg:text-5xl uppercase tracking-tight mb-4">
          Giỏ hàng
        </h1>
        <div className="w-12 h-1 bg-[#F5B800] mb-10" />

        {items.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-20 h-20 text-[#2A2C2F] mx-auto mb-6" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[#6B6E72] font-display text-2xl uppercase tracking-wider mb-2">Giỏ hàng trống</p>
            <p className="text-[#6B6E72] text-sm mb-8">Thêm sản phẩm để bắt đầu mua sắm</p>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-white transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.color}`} className="flex flex-row gap-3 sm:gap-4 bg-[#161819] border border-[#2A2C2F] p-3.5 sm:p-4 rounded-xl items-center">
                  <Link href={`/san-pham/${item.product.slug}`} className="flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1E2022] rounded-lg overflow-hidden flex items-center justify-center p-1">
                      <img src={item.product.images[0].thumbnail} alt={item.product.images[0].alt} className="w-full h-full object-contain" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/san-pham/${item.product.slug}`} className="font-display font-bold text-white text-sm sm:text-base uppercase hover:text-[#F5B800] transition-colors line-clamp-1">
                      {item.product.name}
                    </Link>
                    <p className="text-[#6B6E72] text-xs sm:text-sm flex items-center gap-1.5 mt-1">
                      <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: item.colorHex }} />
                      {item.color}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                      <div className="flex items-center border border-[#2A2C2F] rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.product.id, item.color, item.quantity - 1)} className="w-7 h-7 sm:w-8 sm:h-8 text-white hover:text-[#F5B800] transition-colors flex items-center justify-center text-sm" aria-label="Giảm">−</button>
                        <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-mono text-white">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.color, item.quantity + 1)} className="w-7 h-7 sm:w-8 sm:h-8 text-white hover:text-[#F5B800] transition-colors flex items-center justify-center text-sm" aria-label="Tăng">+</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-[#F5B800] text-sm sm:text-base">
                          {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                        </span>
                        <button onClick={() => removeItem(item.product.id, item.color)} className="text-[#6B6E72] hover:text-red-400 transition-colors p-1" aria-label="Xóa">
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-[#6B6E72] hover:text-red-400 transition-colors text-sm underline">
                Xóa toàn bộ giỏ hàng
              </button>
            </div>

            {/* Summary */}
            <div className="bg-[#161819] border border-[#2A2C2F] p-6 h-fit rounded-xl space-y-5">
              <h2 className="font-display font-bold text-white text-xl uppercase tracking-wider">Tổng đơn hàng</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[#6B6E72] text-sm">
                  <span>Tạm tính</span>
                  <span className="text-white font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[#6B6E72] text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-[#F5B800] font-bold">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>

                {effectiveDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-sm font-medium">
                    <span>Giảm giá ({coupon?.code}):</span>
                    <span>-{formatPrice(effectiveDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Voucher / Coupon Code input block */}
              <div className="border-t border-[#2A2C2F] pt-4 space-y-2.5">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#6B6E72]">
                  Mã giảm giá / Voucher
                </label>
                {coupon ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                        <span>🎟️</span> {coupon.code}
                      </p>
                      <p className="text-[11px] text-emerald-200 mt-0.5">{coupon.discountText}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Hủy mã
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 bg-[#1E2022] border border-[#2A2C2F] text-black px-3 py-2 rounded text-xs outline-none focus:border-[#F5B800] uppercase tracking-wider font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-[#F5B800] hover:bg-white text-black font-display font-bold uppercase tracking-wider text-xs px-4 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Áp dụng"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-400">{couponError}</p>
                    )}
                    {/* Quick Coupon Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["WELCOME15", "ECO200", "BALOVIET20", "FREESHIP"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleApplyCoupon(c)}
                          className="text-[10px] font-mono bg-[#1E2022] hover:bg-[#2A2C2F] border border-[#2A2C2F] text-[#F5B800] px-2 py-0.5 rounded transition-colors"
                        >
                          +{c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#2A2C2F] pt-4">
                <div className="flex justify-between font-display font-bold text-white text-xl">
                  <span>Tổng cộng</span>
                  <span className="text-[#F5B800]">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Link
                href="/thanh-toan"
                className="block w-full bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-center py-4 hover:bg-white transition-colors rounded-lg"
              >
                Thanh toán ngay
              </Link>
              <Link
                href="/san-pham"
                className="block w-full border border-[#2A2C2F] text-white font-display font-bold uppercase tracking-widest text-center py-3 hover:border-white transition-colors text-sm rounded-lg"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
