import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products as productsSchema } from "@/lib/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import type { Product } from "@/data/products";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.toLowerCase();
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    if (category && category !== "all") {
      conditions.push(eq(productsSchema.categorySlug, category));
    }

    if (q) {
      conditions.push(
        or(
          ilike(productsSchema.name, `%${q}%`),
          ilike(productsSchema.categorySlug, `%${q}%`)
        )
      );
    }

    const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch paginated products
    const dbProducts = await db
      .select()
      .from(productsSchema)
      .where(finalCondition)
      .orderBy(desc(productsSchema.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch total count for pagination
    const totalQuery = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(finalCondition);
    
    const totalProducts = totalQuery.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Format products for frontend
    const formattedProducts: Product[] = dbProducts.map((p) => ({
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

    return NextResponse.json({ 
      products: formattedProducts,
      totalPages,
      currentPage: page,
      totalProducts
    });

  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ products: [], totalPages: 1, currentPage: 1, totalProducts: 0 });
  }
}
