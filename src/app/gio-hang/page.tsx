"use client";

import { useCart } from "@/store/cartContext";
import { formatPrice } from "@/data/products";
import Link from "next/link";
import type { Metadata } from "next";

export default function GioHangPage() {
  const { items, totalPrice, removeItem, updateQty, clear } = useCart();

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
                <div key={`${item.product.id}-${item.color}`} className="flex gap-4 bg-[#161819] border border-[#2A2C2F] p-4">
                  <Link href={`/san-pham/${item.product.slug}`} className="flex-shrink-0">
                    <div className="w-24 h-24 bg-[#1E2022] overflow-hidden">
                      <img src={item.product.images[0].thumbnail} alt={item.product.images[0].alt} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/san-pham/${item.product.slug}`} className="font-display font-bold text-white uppercase hover:text-[#F5B800] transition-colors">
                      {item.product.name}
                    </Link>
                    <p className="text-[#6B6E72] text-sm flex items-center gap-1.5 mt-1">
                      <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: item.colorHex }} />
                      {item.color}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#2A2C2F]">
                        <button onClick={() => updateQty(item.product.id, item.color, item.quantity - 1)} className="w-8 h-8 text-white hover:text-[#F5B800] transition-colors flex items-center justify-center" aria-label="Giảm">−</button>
                        <span className="w-10 text-center text-sm font-mono text-white">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.color, item.quantity + 1)} className="w-8 h-8 text-white hover:text-[#F5B800] transition-colors flex items-center justify-center" aria-label="Tăng">+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-display font-bold text-[#F5B800]">
                          {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                        </span>
                        <button onClick={() => removeItem(item.product.id, item.color)} className="text-[#6B6E72] hover:text-red-400 transition-colors" aria-label="Xóa">
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
            <div className="bg-[#161819] border border-[#2A2C2F] p-6 h-fit">
              <h2 className="font-display font-bold text-white text-xl uppercase tracking-wider mb-6">Tổng đơn hàng</h2>
              <div className="flex justify-between text-[#6B6E72] text-sm mb-3">
                <span>Tạm tính</span>
                <span className="text-white font-bold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[#6B6E72] text-sm mb-6">
                <span>Phí vận chuyển</span>
                <span className="text-[#F5B800] font-bold">Miễn phí</span>
              </div>
              <div className="border-t border-[#2A2C2F] pt-4 mb-6">
                <div className="flex justify-between font-display font-bold text-white text-xl">
                  <span>Tổng cộng</span>
                  <span className="text-[#F5B800]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <Link
                href="/thanh-toan"
                className="block w-full bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-center py-4 hover:bg-white transition-colors"
              >
                Thanh toán ngay
              </Link>
              <Link
                href="/san-pham"
                className="block w-full border border-[#2A2C2F] text-white font-display font-bold uppercase tracking-widest text-center py-3 hover:border-white transition-colors text-sm mt-3"
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
