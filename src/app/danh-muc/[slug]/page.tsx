import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { categories as categoriesSchema } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm – Balo Việt",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DanhMucPage({ params }: Props) {
  const { slug } = await params;
  
  let category: any = null;
  try {
    const res = await db
      .select()
      .from(categoriesSchema)
      .where(eq(categoriesSchema.slug, slug))
      .limit(1);
    category = res[0] || null;
  } catch (err) {
    console.warn("Error fetching category:", err);
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <nav className="text-sm text-[#6B6E72] mb-6">
          <Link href="/" className="hover:text-[#F5B800] transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{category?.name ?? slug}</span>
        </nav>
        <h1 className="font-display font-black text-white text-4xl lg:text-5xl uppercase tracking-tight mb-4">
          {category?.name ?? slug}
        </h1>
        <div className="w-12 h-1 bg-[#F5B800] mb-10" />
        {category?.description && (
          <p className="text-[#6B6E72] text-lg mb-8 max-w-2xl">{category.description}</p>
        )}
        <p className="text-[#6B6E72] mb-8">Trang danh mục đang được phát triển.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-white transition-colors"
        >
          ← Về trang chủ
        </Link>
      </div>
    </main>
  );
}
