import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import fetch from "node-fetch";
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = fetch;
} else {
  // Force overwrite because Node's native fetch fails with Neon on some networks (IPv6 issues)
  // @ts-ignore
  globalThis.fetch = fetch;
}


import { db } from "../src/lib/db";
import { users } from "../src/lib/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding admin user...");

  const adminEmail = "admin@baloviet.vn";
  const defaultPassword = "Admin@2026";

  try {
    // Check if admin already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Admin account with email ${adminEmail} already exists.`);
      return;
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

    console.log("✅ Admin account created successfully!");
    console.log("=========================================");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${defaultPassword}`);
    console.log("⚠️ PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN ⚠️");
    console.log("=========================================");
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
