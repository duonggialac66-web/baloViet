import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promotions as promotionsSchema } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  discountType: "percentage" | "fixed" | "freeship";
  discountText: string;
  minOrder: number;
  message: string;
}

// Built-in system vouchers dictionary
const SYSTEM_VOUCHERS: Record<
  string,
  {
    code: string;
    discountType: "percentage" | "fixed" | "freeship";
    percent?: number;
    fixedAmount?: number;
    maxDiscount?: number;
    minOrder: number;
    description: string;
  }
> = {
  WELCOME15: {
    code: "WELCOME15",
    discountType: "percentage",
    percent: 15,
    maxDiscount: 200000,
    minOrder: 0,
    description: "Giảm 15% cho bạn mới (Tối đa 200.000đ)",
  },
  ECO200: {
    code: "ECO200",
    discountType: "fixed",
    fixedAmount: 200000,
    minOrder: 499000,
    description: "Trợ giá 200.000đ cho đơn từ 499.000đ",
  },
  FLASHSALE45: {
    code: "FLASHSALE45",
    discountType: "percentage",
    percent: 45,
    maxDiscount: 450000,
    minOrder: 990000,
    description: "Flash sale giảm 45% (Tối đa 450.000đ, đơn từ 990.000đ)",
  },
  BALOVIET20: {
    code: "BALOVIET20",
    discountType: "percentage",
    percent: 20,
    maxDiscount: 300000,
    minOrder: 499000,
    description: "Giảm 20% cho đơn hàng từ 499.000đ",
  },
  FREESHIP: {
    code: "FREESHIP",
    discountType: "freeship",
    fixedAmount: 30000,
    minOrder: 0,
    description: "Miễn phí vận chuyển 30.000đ",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code: rawCode, subtotal = 0 } = body;

    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json(
        { valid: false, error: "Vui lòng nhập mã giảm giá" },
        { status: 400 }
      );
    }

    const code = rawCode.trim().toUpperCase();

    // 1. Check built-in vouchers
    const builtIn = SYSTEM_VOUCHERS[code];
    let discountAmount = 0;
    let discountText = "";
    let minOrder = 0;
    let discountType: "percentage" | "fixed" | "freeship" = "percentage";

    if (builtIn) {
      minOrder = builtIn.minOrder;
      discountType = builtIn.discountType;

      if (subtotal < minOrder) {
        return NextResponse.json({
          valid: false,
          error: `Mã ${code} chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat(
            "vi-VN"
          ).format(minOrder)}đ trở lên.`,
        });
      }

      if (builtIn.discountType === "percentage") {
        const rawDiscount = Math.round(subtotal * ((builtIn.percent || 0) / 100));
        discountAmount = builtIn.maxDiscount
          ? Math.min(rawDiscount, builtIn.maxDiscount)
          : rawDiscount;
        discountText = `Giảm ${builtIn.percent}% (${new Intl.NumberFormat(
          "vi-VN"
        ).format(discountAmount)}đ)`;
      } else if (builtIn.discountType === "fixed") {
        discountAmount = Math.min(builtIn.fixedAmount || 0, subtotal);
        discountText = `Giảm ${new Intl.NumberFormat("vi-VN").format(
          discountAmount
        )}đ`;
      } else if (builtIn.discountType === "freeship") {
        discountAmount = 30000;
        discountText = "Miễn phí vận chuyển (30.000đ)";
      }

      return NextResponse.json({
        valid: true,
        code,
        discountAmount,
        discountType,
        discountText,
        minOrder,
        message: `Áp dụng mã ${code} thành công! ${discountText}`,
      });
    }

    // 2. Query DB promotions table if not found in built-in
    const promoList = await db
      .select()
      .from(promotionsSchema)
      .where(and(eq(promotionsSchema.isActive, true)));

    const dbPromo = promoList.find(
      (p) => p.code && p.code.trim().toUpperCase() === code
    );

    if (!dbPromo) {
      return NextResponse.json({
        valid: false,
        error: `Mã giảm giá "${code}" không hợp lệ hoặc đã hết hạn.`,
      });
    }

    // Parse DB min order
    if (dbPromo.minOrder) {
      const match = dbPromo.minOrder.match(/\d+/g);
      if (match) {
        const num = parseInt(match.join(""), 10);
        if (num > 0) minOrder = num;
      }
    }

    if (subtotal < minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Mã ${code} chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat(
          "vi-VN"
        ).format(minOrder)}đ trở lên.`,
      });
    }

    // Parse discount value from db (e.g. "200.000Đ" or "15%" or "45%")
    const dVal = dbPromo.discountValue || "";
    if (dVal.includes("%")) {
      const pct = parseInt(dVal.replace(/[^\d]/g, ""), 10) || 10;
      discountAmount = Math.round(subtotal * (pct / 100));
      discountText = `Giảm ${pct}% (${new Intl.NumberFormat("vi-VN").format(
        discountAmount
      )}đ)`;
    } else {
      const fixed = parseInt(dVal.replace(/[^\d]/g, ""), 10) || 50000;
      discountAmount = Math.min(fixed, subtotal);
      discountText = `Giảm ${new Intl.NumberFormat("vi-VN").format(
        discountAmount
      )}đ`;
    }

    return NextResponse.json({
      valid: true,
      code,
      discountAmount,
      discountType: dVal.includes("%") ? "percentage" : "fixed",
      discountText,
      minOrder,
      message: `Áp dụng mã ${code} thành công! ${discountText}`,
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { valid: false, error: "Đã xảy ra lỗi khi kiểm tra mã giảm giá." },
      { status: 500 }
    );
  }
}
