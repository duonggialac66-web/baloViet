import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { verifyPassword, createSession } from "@/lib/auth";
import { validateEmail } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || !validateEmail(email)) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });
    }

    // Hardcoded Admin support
    const HARDCODED_ADMIN_EMAIL = "admin@baloviet.vn";
    const HARDCODED_ADMIN_PASSWORD = "Admin@2026";

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASSWORD) {
      // Ensure admin exists in database
      let adminResult = await db
        .select()
        .from(users)
        .where(eq(users.email, HARDCODED_ADMIN_EMAIL))
        .limit(1);

      let adminUser = adminResult[0];

      if (!adminUser) {
        const adminId = "admin_master";
        await db.insert(users).values({
          id: adminId,
          email: HARDCODED_ADMIN_EMAIL,
          passwordHash: "hardcoded",
          fullName: "Balo Việt Admin",
          role: "admin",
          isActive: true,
          emailVerified: true,
        }).onConflictDoNothing();

        adminResult = await db
          .select()
          .from(users)
          .where(eq(users.email, HARDCODED_ADMIN_EMAIL))
          .limit(1);
        adminUser = adminResult[0];
      }

      await createSession(adminUser ? adminUser.id : "admin_master", req);

      return NextResponse.json({
        success: true,
        user: {
          id: adminUser ? adminUser.id : "admin_master",
          email: HARDCODED_ADMIN_EMAIL,
          fullName: "Balo Việt Admin",
          role: "admin",
          avatar: null,
        },
      });
    }

    // Find user in DB
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    const user = result[0];

    // Verify status
    if (user.isActive === false) {
      return NextResponse.json({ error: "Tài khoản của bạn đã bị khóa" }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // Create session and set cookie
    await createSession(user.id, req);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
