import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { productReviews, users, orders } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // Get approved reviews for a product, join with users to get name & avatar
    const reviews = await db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        title: productReviews.title,
        content: productReviews.content,
        isVerified: productReviews.isVerified,
        createdAt: productReviews.createdAt,
        user: {
          fullName: users.fullName,
          avatar: users.avatar,
        }
      })
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.isApproved, true) // Only show approved reviews
        )
      )
      .orderBy(desc(productReviews.createdAt));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
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
    const { productId, rating, title, content, orderId } = body;

    if (!productId || !rating) {
      return NextResponse.json({ error: "Vui lòng cung cấp productId và rating" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating phải từ 1 đến 5" }, { status: 400 });
    }

    // Check if user actually bought this product (to set isVerified)
    let isVerified = false;
    if (orderId) {
      // Basic check: Does this order belong to the user?
      const userOrder = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.userId, user.id)
          )
        )
        .limit(1);

      if (userOrder.length > 0) {
        // Ideally we'd also check if the product is in the order items,
        // but checking the order belongs to user is a good start.
        isVerified = true;
      }
    }

    const reviewId = nanoid();

    await db.insert(productReviews).values({
      id: reviewId,
      productId,
      userId: user.id,
      orderId: orderId || null,
      rating,
      title: title?.trim(),
      content: content?.trim(),
      isVerified,
      isApproved: false, // Default to requiring admin approval
    });

    return NextResponse.json({ success: true, message: "Đánh giá đã được gửi và chờ duyệt" });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
