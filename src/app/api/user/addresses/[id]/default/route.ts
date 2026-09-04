import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập" }, { status: 401 });
    }

    const resolvedParams = await params;
    const addressId = resolvedParams.id;

    // Verify ownership
    const checkResult = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, user.id)))
      .limit(1);

    if (checkResult.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy địa chỉ này" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      // Unset default on all addresses
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, user.id));

      // Set target address as default
      await tx
        .update(addresses)
        .set({ isDefault: true })
        .where(eq(addresses.id, addressId));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set default address error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
