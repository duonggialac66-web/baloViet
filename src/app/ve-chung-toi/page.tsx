import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Về chúng tôi – Balo Việt",
  description: "Câu chuyện về thương hiệu balo chính hãng Việt Nam.",
};

export default function VeChungToiPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <h1 className="font-display font-black text-white text-4xl lg:text-5xl uppercase tracking-tight mb-4">
          Về chúng tôi
        </h1>
        <div className="w-12 h-1 bg-[#F5B800] mb-10" />
        <p className="text-[#6B6E72] text-lg mb-8">Trang giới thiệu đang được phát triển.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-white transition-colors">
          ← Về trang chủ
        </Link>
      </div>
    </main>
  );
}
