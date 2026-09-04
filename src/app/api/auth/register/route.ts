import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword, createSession } from "@/lib/auth";
import { validateEmail, validatePassword, validateFullName, validatePhone } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, phone } = body;

    // Validate inputs
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Mật khẩu phải từ 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số" },
        { status: 400 }
      );
    }
    if (!validateFullName(fullName)) {
      return NextResponse.json({ error: "Họ tên phải từ 2 ký tự" }, { status: 400 });
    }
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = nanoid();

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : null,
      role: "customer",
    });

    // Create session and set cookie
    await createSession(userId, req);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          fullName: fullName.trim(),
          role: "customer",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
