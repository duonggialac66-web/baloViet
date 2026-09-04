import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { db } from "./db";
import { sessions, users } from "./schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "baloviet_session";
const SESSION_EXPIRY_DAYS = 30;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session management
export async function createSession(userId: string, req?: Request): Promise<string> {
  const sessionId = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  let userAgent = null;
  let ipAddress = null;

  if (req) {
    userAgent = req.headers.get("user-agent");
    ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  }

  // Insert session into database
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
    userAgent,
    ipAddress,
  });

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    return { session: null, user: null };
  }

  // Fetch session and associated user
  const result = await db
    .select({
      session: sessions,
      user: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        avatar: users.avatar,
        role: users.role,
        isActive: users.isActive,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (result.length === 0) {
    return { session: null, user: null };
  }

  const { session, user } = result[0];

  // Check if session has expired
  if (new Date() > new Date(session.expiresAt)) {
    // Delete expired session
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    cookieStore.delete(COOKIE_NAME);
    return { session: null, user: null };
  }

  // Optionally extend session if it's halfway to expiry
  const halfExpiry = new Date(session.createdAt || new Date());
  halfExpiry.setDate(halfExpiry.getDate() + SESSION_EXPIRY_DAYS / 2);
  if (new Date() > halfExpiry) {
    const nextExpiresAt = new Date();
    nextExpiresAt.setDate(nextExpiresAt.getDate() + SESSION_EXPIRY_DAYS);
    
    await db
      .update(sessions)
      .set({ expiresAt: nextExpiresAt })
      .where(eq(sessions.id, sessionId));
      
    cookieStore.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: nextExpiresAt,
      path: "/",
    });
  }

  return { session, user };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    cookieStore.delete(COOKIE_NAME);
  }
}
