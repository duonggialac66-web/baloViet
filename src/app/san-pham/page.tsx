import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { products as productsSchema } from "@/lib/schema";
import { desc } from "drizzle-orm";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm – Balo Việt",
  description: "Khám phá toàn bộ bộ sưu tập balo chính hãng của Balo Việt.",
};

export default async function SanPhamPage() {
  let dbProducts: any[] = [];
  try {
    dbProducts = await db
      .select()
      .from(productsSchema)
      .orderBy(desc(productsSchema.createdAt));
  } catch (err) {
    console.warn("Error fetching products:", err);
  }

  const productsList: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    category: p.categorySlug === "balo-laptop" ? "Balo Laptop" :
              p.categorySlug === "balo-du-lich" ? "Balo Du Lịch" :
              p.categorySlug === "balo-hoc-sinh" ? "Balo Học Sinh" :
              p.categorySlug === "balo-thoi-trang" ? "Balo Thời Trang" :
              p.categorySlug === "balo-chong-nuoc" ? "Balo Chống Nước" : "Balo Cao Cấp",
    categorySlug: p.categorySlug,
    stock: p.stock,
    rating: p.rating,
    reviews: p.reviews,
    shortDescription: p.shortDescription,
    description: p.description,
    specifications: (p.specifications as Record<string, string>) || {},
    tags: p.tags || [],
    images: (p.imageIds || []).map((url: string, index: number) => ({
      url,
      alt: p.imageAlts?.[index] || p.name,
      thumbnail: url,
    })),
    colors: (p.colors as { name: string; hex: string }[]) || [{ name: "Đen", hex: "#000000" }],
    isBestSeller: p.isBestSeller ?? false,
    isNew: p.isNew ?? false,
  }));

  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="font-display font-black text-white text-3xl lg:text-5xl uppercase tracking-tight mb-2">
              Bộ Sưu Tập Balo
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Hiển thị {productsList.length} sản phẩm chính hãng cao cấp
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-display font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-white transition-colors rounded-sm"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>

        {productsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500">
            <p className="text-lg">Chưa có sản phẩm nào trong kho dữ liệu.</p>
          </div>
        )}
      </div>
    </main>
  );
}
