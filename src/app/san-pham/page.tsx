import type { Metadata } from "next";
import { db } from "@/lib/db";
import { 
  products as productsSchema, 
  categories as categoriesSchema,
  promotions as promotionsSchema
} from "@/lib/schema";
import { eq, desc, asc } from "drizzle-orm";
import ProductsPageClient from "@/components/product/ProductsPageClient";
import type { Product } from "@/data/products";
import type { PromotionItem } from "@/components/product/HotDealsCarousel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm – Balo Việt",
  description: "Khám phá các danh mục balo chính hãng của Balo Việt. Thiết kế công thái học, chống nước IPX7 và đệm chống sốc 360°.",
};

import { Suspense } from "react";

export default async function SanPhamPage() {
  let dbProducts: any[] = [];
  let dbCategories: any[] = [];
  let dbPromotions: any[] = [];

  try {
    const [prods, cats, promos] = await Promise.all([
      db
        .select()
        .from(productsSchema)
        .orderBy(desc(productsSchema.createdAt)),
      db
        .select()
        .from(categoriesSchema),
      db
        .select()
        .from(promotionsSchema)
        .where(eq(promotionsSchema.isActive, true))
        .orderBy(asc(promotionsSchema.sortOrder)),
    ]);
    dbProducts = prods;
    dbCategories = cats;
    dbPromotions = promos;
  } catch (err) {
    console.warn("Error fetching products, categories, or promotions:", err);
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
    stock: p.stock ?? 0,
    rating: p.rating ?? 4.8,
    reviews: p.reviews ?? 0,
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    specifications: (p.specifications as Record<string, string>) || {},
    tags: p.tags || [],
    images: (p.imageIds && p.imageIds.length > 0)
      ? p.imageIds.map((url: string, index: number) => ({
          url,
          alt: p.imageAlts?.[index] || p.name,
          thumbnail: url,
        }))
      : [{
          url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
          alt: p.name,
          thumbnail: "",
        }],
    colors: (p.colors as { name: string; hex: string }[]) || [{ name: "Đen", hex: "#000000" }],
    isBestSeller: p.isBestSeller ?? false,
    isNew: p.isNew ?? false,
  }));

  const formattedCategories = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageId: c.imageId,
    description: c.description,
    displaySettings: c.displaySettings || null,
    count: c.count,
  }));

  const formattedPromotions: PromotionItem[] = dbPromotions.map((pr) => ({
    id: pr.id,
    tag: pr.tag,
    badge: pr.badge,
    title: pr.title,
    highlight: pr.highlight,
    discountValue: pr.discountValue,
    description: pr.description,
    code: pr.code,
    ctaText: pr.ctaText,
    targetUrl: pr.targetUrl,
    imageUrl: pr.imageUrl,
  }));

  return (
    <main className="min-h-screen bg-[#0B0D0E]">
      <Suspense fallback={<div className="min-h-screen bg-[#0B0D0E]" />}>
        <ProductsPageClient
          products={productsList}
          categories={formattedCategories}
          promotions={formattedPromotions}
        />
      </Suspense>
    </main>
  );
}
