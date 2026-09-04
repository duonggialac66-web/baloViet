import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { productReviews, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const reviews = await db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        rating: productReviews.rating,
        title: productReviews.title,
        content: productReviews.content,
        isApproved: productReviews.isApproved,
        isVerified: productReviews.isVerified,
        createdAt: productReviews.createdAt,
        user: { fullName: users.fullName, email: users.email },
      })
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .orderBy(desc(productReviews.createdAt));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Fetch admin reviews error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const { reviewId, isApproved } = body;

    if (!reviewId || typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    await db.update(productReviews).set({ isApproved }).where(eq(productReviews.id, reviewId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    await db.delete(productReviews).where(eq(productReviews.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
