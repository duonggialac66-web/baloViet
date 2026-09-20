import type { Metadata } from "next";
import { db } from "@/lib/db";
import { 
  products as productsSchema, 
  categories as categoriesSchema,
  promotions as promotionsSchema
} from "@/lib/schema";
import { eq, desc, asc, count } from "drizzle-orm";
import { productListColumns, formatProductForCard } from "@/lib/queries";
import ProductsPageClient from "@/components/product/ProductsPageClient";
import type { Product } from "@/data/products";
import type { PromotionItem } from "@/components/product/HotDealsCarousel";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm – Balo Việt",
  description: "Khám phá các danh mục balo chính hãng của Balo Việt. Thiết kế công thái học, chống nước IPX7 và đệm chống sốc 360°.",
};

import { Suspense } from "react";

const PRODUCTS_PER_PAGE = 8;

export default async function SanPhamPage() {
  let dbProducts: any[] = [];
  let dbCategories: any[] = [];
  let dbPromotions: any[] = [];
  let totalPages = 1;

  try {
    const [prods, cats, promos, totalQuery] = await Promise.all([
      db
        .select(productListColumns)
        .from(productsSchema)
        .orderBy(desc(productsSchema.createdAt))
        .limit(PRODUCTS_PER_PAGE),
      db
        .select()
        .from(categoriesSchema),
      db
        .select()
        .from(promotionsSchema)
        .where(eq(promotionsSchema.isActive, true))
        .orderBy(asc(promotionsSchema.sortOrder)),
      db
        .select({ total: count() })
        .from(productsSchema),
    ]);
    dbProducts = prods;
    dbCategories = cats;
    dbPromotions = promos;
    totalPages = Math.ceil((totalQuery[0]?.total || 0) / PRODUCTS_PER_PAGE);
  } catch (err) {
    console.warn("Error fetching products, categories, or promotions:", err);
  }

  // Format products using shared helper
  const productsList: Product[] = dbProducts.map(formatProductForCard);

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
          initialTotalPages={totalPages}
        />
      </Suspense>
    </main>
  );
}

