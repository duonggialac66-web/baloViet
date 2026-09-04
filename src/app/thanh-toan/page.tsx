import type { Metadata } from "next";
import CheckoutClient from "@/components/auth/CheckoutClient";

export const metadata: Metadata = {
  title: "Thanh toán – Balo Việt",
  description: "Trang thanh toán đặt mua sản phẩm balo chính hãng tại Balo Việt",
};

export default function ThanhToanPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 bg-brand-black">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <h1 className="font-display font-black text-3xl lg:text-4xl text-white uppercase tracking-tight mb-2">
          Thanh toán đơn hàng
        </h1>
        <div className="w-16 h-1 bg-brand-gold mb-10" />
        
        <CheckoutClient />
      </div>
    </main>
  );
}
