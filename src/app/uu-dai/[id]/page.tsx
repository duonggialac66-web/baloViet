import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  promotions as promotionsSchema,
  products as productsSchema,
} from "@/lib/schema";
import { eq, ne, and, asc, desc } from "drizzle-orm";
import PromotionDetailClient from "@/components/promotions/PromotionDetailClient";
import type { Product } from "@/data/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const [promo] = await db
      .select()
      .from(promotionsSchema)
      .where(eq(promotionsSchema.id, id));

    if (promo) {
      return {
        title: `${promo.title} | Ưu Đãi Balo Việt`,
        description: promo.description || promo.highlight,
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Chi Tiết Ưu Đãi | Balo Việt",
    description: "Chương trình khuyến mãi ưu đãi đặc biệt tại Balo Việt",
  };
}

export const revalidate = 60;

export default async function PromotionDetailPage({ params }: PageProps) {
  const { id } = await params;

  let promoData: (typeof promotionsSchema.$inferSelect) | null = null;
  let dbProducts: (typeof productsSchema.$inferSelect)[] = [];
  let otherPromos: (typeof promotionsSchema.$inferSelect)[] = [];

  try {
    const [promoRes] = await db
      .select()
      .from(promotionsSchema)
      .where(eq(promotionsSchema.id, id));

    promoData = promoRes || null;

    if (promoData) {
      const [productsRes, othersRes] = await Promise.all([
        db
          .select()
          .from(productsSchema)
          .orderBy(desc(productsSchema.isBestSeller), desc(productsSchema.createdAt))
          .limit(8),
        db
          .select()
          .from(promotionsSchema)
          .where(and(eq(promotionsSchema.isActive, true), ne(promotionsSchema.id, id)))
          .orderBy(asc(promotionsSchema.sortOrder))
          .limit(3),
      ]);

      dbProducts = productsRes;
      otherPromos = othersRes;
    }
  } catch (err) {
    console.warn("Error fetching promotion detail from DB:", err);
  }

  if (!promoData) {
    notFound();
  }

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
    <PromotionDetailClient
      promotion={promoData}
      applicableProducts={formattedProducts}
      otherPromotions={otherPromos}
    />
  );
}
