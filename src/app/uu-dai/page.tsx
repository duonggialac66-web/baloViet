import { Metadata } from "next";
import { db } from "@/lib/db";
import {
  promotions as promotionsSchema,
  products as productsSchema,
} from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";
import PromotionsPageClient from "@/components/promotions/PromotionsPageClient";
import type { Product } from "@/data/products";

export const metadata: Metadata = {
  title: "Ưu Đãi Khuyến Mãi Balo Việt | Voucher & Deal Khủng Mỗi Ngày",
  description:
    "Tổng hợp mã giảm giá, voucher freeship và các chương trình ưu đãi khuyến mãi balo laptop, balo du lịch cao cấp chính hãng từ Balo Việt.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PromotionsPage() {
  let dbPromotions: (typeof promotionsSchema.$inferSelect)[] = [];
  let dbProducts: (typeof productsSchema.$inferSelect)[] = [];

  try {
    const [promoRes, productRes] = await Promise.all([
      db
        .select()
        .from(promotionsSchema)
        .where(eq(promotionsSchema.isActive, true))
        .orderBy(asc(promotionsSchema.sortOrder), desc(promotionsSchema.createdAt)),
      db
        .select()
        .from(productsSchema)
        .orderBy(desc(productsSchema.isBestSeller), desc(productsSchema.createdAt))
        .limit(12),
    ]);

    dbPromotions = promoRes;
    dbProducts = productRes;
  } catch (err) {
    console.warn("Error fetching promotions page data from DB:", err);
  }

  // Format DB products into Product interface
  const formattedProducts: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || p.id,
    price: p.price,
    salePrice: p.salePrice || undefined,
    category:
      p.categorySlug === "balo-laptop"
        ? "Balo Laptop"
        : p.categorySlug === "balo-du-lich"
        ? "Balo Du Lịch"
        : p.categorySlug === "balo-hoc-sinh"
        ? "Balo Học Sinh"
        : p.categorySlug === "balo-thoi-trang"
        ? "Balo Thời Trang"
        : p.categorySlug === "balo-chong-nuoc"
        ? "Balo Chống Nước"
        : "Balo Cao Cấp",
    categorySlug: p.categorySlug,
    stock: p.stock ?? 0,
    rating: Number(p.rating) || 4.9,
    reviews: p.reviews ?? 0,
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    specifications: (p.specifications as Record<string, string>) || {},
    tags: (p.tags as string[]) || ["Hot"],
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
    <PromotionsPageClient
      promotions={dbPromotions}
      products={formattedProducts}
    />
  );
}
