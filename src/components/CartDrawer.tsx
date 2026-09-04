"use client";

import { useCart } from "@/store/cartContext";
import { formatPrice } from "@/data/products";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeDrawer, removeItem, updateQty, totalPrice, totalItems } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[80] backdrop-blur-sm"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#0B0D0E] border-l border-[#2A2C2F] z-[90] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0 drawer-enter" : "translate-x-full"
        }`}
        aria-label="Giỏ hàng"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2C2F]">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-white text-xl uppercase tracking-wider">
              Giỏ Hàng
            </h2>
            {totalItems > 0 && (
              <span className="bg-[#F5B800] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="text-[#6B6E72] hover:text-white transition-colors"
            aria-label="Đóng giỏ hàng"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <svg className="w-16 h-16 text-[#2A2C2F] mb-4" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-[#6B6E72] font-display text-lg uppercase tracking-wider">Giỏ hàng trống</p>
              <p className="text-[#6B6E72] text-sm mt-1 mb-6">Thêm sản phẩm để bắt đầu mua sắm</p>
              <button
                onClick={closeDrawer}
                className="bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-white transition-colors"
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.color}`}
                className="flex gap-3 pb-4 border-b border-[#2A2C2F] last:border-0"
              >
                <Link href={`/san-pham/${item.product.slug}`} onClick={closeDrawer} className="flex-shrink-0">
                  <div className="w-20 h-20 bg-[#1E2022] overflow-hidden">
                    <img
                      src={item.product.images[0].thumbnail}
                      alt={item.product.images[0].alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/san-pham/${item.product.slug}`}
                    onClick={closeDrawer}
                    className="font-display font-bold text-white text-sm uppercase leading-tight hover:text-[#F5B800] transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[#6B6E72] text-xs mt-0.5 flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full inline-block border border-white/20"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    {item.color}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#2A2C2F]">
                      <button
                        onClick={() => updateQty(item.product.id, item.color, item.quantity - 1)}
                        className="w-7 h-7 text-white hover:text-[#F5B800] transition-colors text-lg leading-none flex items-center justify-center"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-mono text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, item.color, item.quantity + 1)}
                        className="w-7 h-7 text-white hover:text-[#F5B800] transition-colors text-lg leading-none flex items-center justify-center"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-display font-bold text-[#F5B800] text-sm">
                      {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id, item.color)}
                  className="flex-shrink-0 text-[#6B6E72] hover:text-red-400 transition-colors self-start mt-0.5"
                  aria-label="Xóa sản phẩm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#2A2C2F] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6B6E72] text-sm">Tạm tính</span>
              <span className="font-display font-bold text-white text-lg">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-[#6B6E72] text-xs">Phí vận chuyển & voucher tính ở bước thanh toán</p>
            <Link
              href="/thanh-toan"
              onClick={closeDrawer}
              className="block w-full bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-center py-4 hover:bg-white transition-colors"
            >
              Thanh toán ngay
            </Link>
            <Link
              href="/gio-hang"
              onClick={closeDrawer}
              className="block w-full border border-[#2A2C2F] text-white font-display font-bold uppercase tracking-widest text-center py-3 hover:border-white transition-colors text-sm"
            >
              Xem giỏ hàng
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
