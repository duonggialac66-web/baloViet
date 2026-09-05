import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uiConfigs } from "@/lib/schema";
import { eq } from "drizzle-orm";

import { DEFAULT_HOME_POLICY } from "@/components/home/BrandGuaranteeSection";

const POLICY_CONFIG_ID = "home_guarantee_policy";

export async function GET() {
  try {
    const existing = await db
      .select()
      .from(uiConfigs)
      .where(eq(uiConfigs.id, POLICY_CONFIG_ID))
      .limit(1);

    if (existing.length > 0 && existing[0].spec) {
      try {
        const parsed = JSON.parse(existing[0].spec);
        return NextResponse.json({ config: { ...DEFAULT_HOME_POLICY, ...parsed } });
      } catch {
        // fallback
      }
    }

    return NextResponse.json({ config: DEFAULT_HOME_POLICY });
  } catch (error) {
    console.error("Fetch policy config error:", error);
    return NextResponse.json({ config: DEFAULT_HOME_POLICY });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const configData = {
      announcementTitle: body.announcementTitle || DEFAULT_HOME_POLICY.announcementTitle,
      announcementSubtitle: body.announcementSubtitle || DEFAULT_HOME_POLICY.announcementSubtitle,
      card1Title: body.card1Title || DEFAULT_HOME_POLICY.card1Title,
      card1Desc: body.card1Desc || DEFAULT_HOME_POLICY.card1Desc,
      card2Title: body.card2Title || DEFAULT_HOME_POLICY.card2Title,
      card2Desc: body.card2Desc || DEFAULT_HOME_POLICY.card2Desc,
      brandTitle: body.brandTitle || DEFAULT_HOME_POLICY.brandTitle,
      brandIntro: body.brandIntro || DEFAULT_HOME_POLICY.brandIntro,
      reasonsTitle: body.reasonsTitle || DEFAULT_HOME_POLICY.reasonsTitle,
      reasons: Array.isArray(body.reasons) ? body.reasons : DEFAULT_HOME_POLICY.reasons,
    };

    const serialized = JSON.stringify(configData);

    const existing = await db
      .select()
      .from(uiConfigs)
      .where(eq(uiConfigs.id, POLICY_CONFIG_ID))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(uiConfigs)
        .set({
          type: "home_policy",
          targetId: "homepage",
          spec: serialized,
        })
        .where(eq(uiConfigs.id, POLICY_CONFIG_ID));
    } else {
      await db.insert(uiConfigs).values({
        id: POLICY_CONFIG_ID,
        type: "home_policy",
        targetId: "homepage",
        spec: serialized,
      });
    }

    return NextResponse.json({ success: true, config: configData });
  } catch (error) {
    console.error("Save policy config error:", error);
    return NextResponse.json({ error: "Lỗi lưu cấu hình" }, { status: 500 });
  }
}
