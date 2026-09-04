import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";

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

    const body = await req.json();
    const { fullName, phone, province, district, ward, street, isDefault } = body;

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
      if (isDefault) {
        // Set all other addresses for this user to isDefault = false
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, user.id));
      }

      await tx
        .update(addresses)
        .set({
          fullName: fullName ? fullName.trim() : undefined,
          phone: phone ? phone.trim() : undefined,
          province: province ? province.trim() : undefined,
          district: district ? district.trim() : undefined,
          ward: ward ? ward.trim() : undefined,
          street: street ? street.trim() : undefined,
          isDefault: isDefault !== undefined ? isDefault : undefined,
        })
        .where(eq(addresses.id, addressId));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const wasDefault = checkResult[0].isDefault;

    await db.transaction(async (tx) => {
      // Delete address
      await tx.delete(addresses).where(eq(addresses.id, addressId));

      // If we deleted the default address, make another one default
      if (wasDefault) {
        const remaining = await tx
          .select()
          .from(addresses)
          .where(eq(addresses.userId, user.id))
          .limit(1);

        if (remaining.length > 0) {
          await tx
            .update(addresses)
            .set({ isDefault: true })
            .where(eq(addresses.id, remaining[0].id));
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
