import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const all = await db.select().from(categories);
    return NextResponse.json({ categories: all });
  } catch (error) {
    console.error("Fetch categories error:", error);
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
    const { name, slug, description, imageId, imageAlt, displaySettings } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Tên và slug là bắt buộc" }, { status: 400 });
    }

    const id = nanoid();
    await db.insert(categories).values({
      id,
      name,
      slug,
      description: description || null,
      imageId: imageId || null,
      imageAlt: imageAlt || null,
      displaySettings: displaySettings || null,
    });

    revalidatePath("/san-pham");
    revalidatePath("/admin/danh-muc");
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Create category error:", error);
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
    const { id, name, slug, description, imageId, imageAlt, displaySettings } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    await db.update(categories).set({
      name,
      slug,
      description: description || null,
      imageId: imageId || null,
      imageAlt: imageAlt || null,
      displaySettings: displaySettings || null,
    }).where(eq(categories.id, id));

    revalidatePath("/san-pham");
    revalidatePath("/admin/danh-muc");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update category error:", error);
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

    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/san-pham");
    revalidatePath("/admin/danh-muc");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
