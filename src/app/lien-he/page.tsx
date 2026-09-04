import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Liên hệ – Balo Việt",
  description: "Liên hệ với chúng tôi để được tư vấn và hỗ trợ.",
};

export default function LienHePage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <h1 className="font-display font-black text-white text-4xl lg:text-5xl uppercase tracking-tight mb-4">
          Liên hệ
        </h1>
        <div className="w-12 h-1 bg-[#F5B800] mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <p className="text-[#6B6E72] text-sm uppercase tracking-widest mb-1">Hotline</p>
              <p className="text-white font-display font-bold text-2xl">1900-1234</p>
            </div>
            <div>
              <p className="text-[#6B6E72] text-sm uppercase tracking-widest mb-1">Email</p>
              <p className="text-white font-display font-bold text-xl">hello@baloviet.vn</p>
            </div>
            <div>
              <p className="text-[#6B6E72] text-sm uppercase tracking-widest mb-1">Địa chỉ</p>
              <p className="text-white">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
          <div className="bg-[#161819] border border-[#2A2C2F] p-8">
            <p className="text-[#6B6E72] mb-6">Form liên hệ đang được phát triển.</p>
          </div>
        </div>
        <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-white transition-colors">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
