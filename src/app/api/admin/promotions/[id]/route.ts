import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotions } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;
    const promo = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, id))
      .limit(1);

    if (promo.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy chương trình ưu đãi" }, { status: 404 });
    }

    return NextResponse.json({ promotion: promo[0] });
  } catch (error) {
    console.error("Fetch single promotion error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
