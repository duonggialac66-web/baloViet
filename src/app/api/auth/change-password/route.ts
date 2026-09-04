import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/validations";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải từ 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số" },
        { status: 400 }
      );
    }

    // Fetch password hash from DB
    const result = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    const { passwordHash } = result[0];

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác" }, { status: 400 });
    }

    // Update password hash
    const newPasswordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
