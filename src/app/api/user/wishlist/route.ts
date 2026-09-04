import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItems, products } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập" }, { status: 401 });
    }

    const items = await db
      .select({
        id: wishlistItems.id,
        productId: wishlistItems.productId,
        product: products,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, user.id));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Thiếu productId" }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: true, message: "Sản phẩm đã có trong danh sách yêu thích" });
    }

    // Check if product exists
    const prodCheck = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (prodCheck.length === 0) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    const wishId = nanoid();
    await db.insert(wishlistItems).values({
      id: wishId,
      userId: user.id,
      productId,
    });

    return NextResponse.json({ success: true, id: wishId });
  } catch (error) {
    console.error("Add wishlist item error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
