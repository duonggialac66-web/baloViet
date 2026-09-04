import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotions } from "@/lib/schema";
import { nanoid } from "nanoid";
import { eq, asc, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const allPromos = await db
      .select()
      .from(promotions)
      .orderBy(asc(promotions.sortOrder), desc(promotions.createdAt));

    return NextResponse.json({ promotions: allPromos });
  } catch (error) {
    console.error("Fetch promotions error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      highlight,
      badge,
      tag,
      description,
      code,
      discountValue,
      minOrder,
      giftText,
      ctaText,
      targetUrl,
      imageUrl,
      originalPrice,
      salePrice,
      floatingPerks,
      sortOrder,
      isActive,
    } = body;

    if (!title || !badge || !imageUrl) {
      return NextResponse.json(
        { error: "Tiêu đề, huy hiệu và ảnh đại diện là bắt buộc" },
        { status: 400 }
      );
    }

    const id = `promo-${nanoid(8)}`;

    await db.insert(promotions).values({
      id,
      tag: tag || "ƯU ĐÃI ĐẶC BIỆT",
      badge,
      title,
      highlight: highlight || title,
      description: description || "",
      code: code ? code.trim().toUpperCase() : null,
      discountValue: discountValue || null,
      minOrder: minOrder || null,
      giftText: giftText || null,
      ctaText: ctaText || "SĂN DEAL NGAY",
      targetUrl: targetUrl || "/san-pham",
      imageUrl,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      salePrice: salePrice ? Number(salePrice) : null,
      floatingPerks: Array.isArray(floatingPerks)
        ? floatingPerks
        : typeof floatingPerks === "string"
        ? floatingPerks.split("\n").filter((p: string) => p.trim().length > 0)
        : [],
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Create promotion error:", error);
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
    const {
      id,
      title,
      highlight,
      badge,
      tag,
      description,
      code,
      discountValue,
      minOrder,
      giftText,
      ctaText,
      targetUrl,
      imageUrl,
      originalPrice,
      salePrice,
      floatingPerks,
      sortOrder,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID chương trình ưu đãi" }, { status: 400 });
    }

    await db
      .update(promotions)
      .set({
        tag: tag || "ƯU ĐÃI ĐẶC BIỆT",
        badge,
        title,
        highlight: highlight || title,
        description: description || "",
        code: code ? code.trim().toUpperCase() : null,
        discountValue: discountValue || null,
        minOrder: minOrder || null,
        giftText: giftText || null,
        ctaText: ctaText || "SĂN DEAL NGAY",
        targetUrl: targetUrl || "/san-pham",
        imageUrl,
        originalPrice: originalPrice ? Number(originalPrice) : null,
        salePrice: salePrice ? Number(salePrice) : null,
        floatingPerks: Array.isArray(floatingPerks)
          ? floatingPerks
          : typeof floatingPerks === "string"
          ? floatingPerks.split("\n").filter((p: string) => p.trim().length > 0)
          : [],
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        updatedAt: new Date(),
      })
      .where(eq(promotions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update promotion error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID chương trình ưu đãi" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updatePayload.sortOrder = Number(sortOrder);

    await db.update(promotions).set(updatePayload).where(eq(promotions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Patch promotion error:", error);
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
      return NextResponse.json({ error: "Thiếu ID chương trình ưu đãi" }, { status: 400 });
    }

    await db.delete(promotions).where(eq(promotions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete promotion error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
