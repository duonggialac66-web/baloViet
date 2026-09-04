import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;
    
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ product: result[0] });
  } catch (error) {
    console.error("Fetch product error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const { imageUrl, imageIds, imageAlts, ...rest } = body;
    const finalImageIds = imageIds !== undefined ? imageIds : (imageUrl ? [imageUrl] : undefined);
    const finalImageAlts = imageAlts !== undefined ? imageAlts : (rest.name ? [rest.name] : undefined);

    const updateData: Record<string, any> = {
      ...rest,
      updatedAt: new Date(),
    };

    if (finalImageIds !== undefined) {
      updateData.imageIds = finalImageIds;
    }
    if (finalImageAlts !== undefined) {
      updateData.imageAlts = finalImageAlts;
    }

    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
