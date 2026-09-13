import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uiConfigs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_ABOUT_CONTENT, DEFAULT_CONTACT_CONTENT } from "@/lib/siteContent";

const ABOUT_CONFIG_ID = "site_about_content";
const CONTACT_CONFIG_ID = "site_contact_content";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "about" or "contact"

    if (type === "about") {
      const existing = await db
        .select()
        .from(uiConfigs)
        .where(eq(uiConfigs.id, ABOUT_CONFIG_ID))
        .limit(1);

      if (existing.length > 0 && existing[0].spec) {
        try {
          const parsed = JSON.parse(existing[0].spec);
          return NextResponse.json({ config: { ...DEFAULT_ABOUT_CONTENT, ...parsed } });
        } catch {
          // fallback
        }
      }
      return NextResponse.json({ config: DEFAULT_ABOUT_CONTENT });
    }

    if (type === "contact") {
      const existing = await db
        .select()
        .from(uiConfigs)
        .where(eq(uiConfigs.id, CONTACT_CONFIG_ID))
        .limit(1);

      if (existing.length > 0 && existing[0].spec) {
        try {
          const parsed = JSON.parse(existing[0].spec);
          return NextResponse.json({ config: { ...DEFAULT_CONTACT_CONTENT, ...parsed } });
        } catch {
          // fallback
        }
      }
      return NextResponse.json({ config: DEFAULT_CONTACT_CONTENT });
    }

    // Return both
    const [aboutConfig, contactConfig] = await Promise.all([
      db.select().from(uiConfigs).where(eq(uiConfigs.id, ABOUT_CONFIG_ID)).limit(1),
      db.select().from(uiConfigs).where(eq(uiConfigs.id, CONTACT_CONFIG_ID)).limit(1),
    ]);

    let about = DEFAULT_ABOUT_CONTENT;
    let contact = DEFAULT_CONTACT_CONTENT;

    if (aboutConfig.length > 0 && aboutConfig[0].spec) {
      try { about = { ...DEFAULT_ABOUT_CONTENT, ...JSON.parse(aboutConfig[0].spec) }; } catch {}
    }
    if (contactConfig.length > 0 && contactConfig[0].spec) {
      try { contact = { ...DEFAULT_CONTACT_CONTENT, ...JSON.parse(contactConfig[0].spec) }; } catch {}
    }

    return NextResponse.json({ about, contact });
  } catch (error) {
    console.error("Fetch site content error:", error);
    return NextResponse.json({ about: DEFAULT_ABOUT_CONTENT, contact: DEFAULT_CONTACT_CONTENT });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const { type, data } = body; // type: "about" | "contact"

    if (type === "about") {
      const serialized = JSON.stringify(data);
      const existing = await db
        .select()
        .from(uiConfigs)
        .where(eq(uiConfigs.id, ABOUT_CONFIG_ID))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(uiConfigs)
          .set({ type: "site_about", targetId: "about_page", spec: serialized })
          .where(eq(uiConfigs.id, ABOUT_CONFIG_ID));
      } else {
        await db.insert(uiConfigs).values({
          id: ABOUT_CONFIG_ID,
          type: "site_about",
          targetId: "about_page",
          spec: serialized,
        });
      }
      return NextResponse.json({ success: true, message: "Lưu trang Về chúng tôi thành công!" });
    }

    if (type === "contact") {
      const serialized = JSON.stringify(data);
      const existing = await db
        .select()
        .from(uiConfigs)
        .where(eq(uiConfigs.id, CONTACT_CONFIG_ID))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(uiConfigs)
          .set({ type: "site_contact", targetId: "contact_page", spec: serialized })
          .where(eq(uiConfigs.id, CONTACT_CONFIG_ID));
      } else {
        await db.insert(uiConfigs).values({
          id: CONTACT_CONFIG_ID,
          type: "site_contact",
          targetId: "contact_page",
          spec: serialized,
        });
      }
      return NextResponse.json({ success: true, message: "Lưu trang Liên hệ thành công!" });
    }

    return NextResponse.json({ error: "Loại cấu hình không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Save site content error:", error);
    return NextResponse.json({ error: "Lỗi lưu cấu hình trang" }, { status: 500 });
  }
}
