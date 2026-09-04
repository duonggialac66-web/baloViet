import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, user.id));

    // Sort by isDefault first, then by createdAt descending
    const sortedAddresses = result.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0; // maintain relative order
    });

    return NextResponse.json({ addresses: sortedAddresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
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
    const { fullName, phone, province, district, ward, street, isDefault } = body;

    if (!fullName || !phone || !province || !district || !ward || !street) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    const addressId = nanoid();

    await db.transaction(async (tx) => {
      // If setting as default, unset default on other addresses of this user
      if (isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, user.id));
      }

      // Check if this is the user's first address. If so, make it default automatically
      const existingAddresses = await tx
        .select()
        .from(addresses)
        .where(eq(addresses.userId, user.id))
        .limit(1);

      const makeDefault = existingAddresses.length === 0 ? true : isDefault;

      await tx.insert(addresses).values({
        id: addressId,
        userId: user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        street: street.trim(),
        isDefault: makeDefault,
      });
    });

    return NextResponse.json({ success: true, addressId });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
