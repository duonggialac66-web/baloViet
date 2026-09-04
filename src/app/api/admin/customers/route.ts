import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/schema";
import { eq, ne, desc, count, sum } from "drizzle-orm";

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const customers = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        avatar: users.avatar,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(ne(users.role, "admin"))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Fetch customers error:", error);
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
    const { userId, isActive } = body;

    if (!userId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    await db.update(users).set({ isActive }).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
