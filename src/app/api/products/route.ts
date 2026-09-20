import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products as productsSchema } from "@/lib/schema";
import { eq, desc, and, or, ilike, count } from "drizzle-orm";
import { productListColumns, formatProductForCard } from "@/lib/queries";

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

    // Fetch paginated products (only list columns) + total count in parallel
    const [dbProducts, totalQuery] = await Promise.all([
      db
        .select(productListColumns)
        .from(productsSchema)
        .where(finalCondition)
        .orderBy(desc(productsSchema.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(productsSchema)
        .where(finalCondition),
    ]);

    const totalProducts = totalQuery[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    // Format products using shared helper
    const formattedProducts = dbProducts.map(formatProductForCard);

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

