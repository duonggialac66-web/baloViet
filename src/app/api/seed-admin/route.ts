import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const adminEmail = "admin@baloviet.vn";
    const defaultPassword = "Admin@2026";
    
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ message: "Admin account already exists." });
    }

    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const adminId = nanoid();

    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      passwordHash,
      fullName: "System Admin",
      role: "admin",
      isActive: true,
      emailVerified: true,
    });

    return NextResponse.json({ message: "Admin account created successfully!" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
