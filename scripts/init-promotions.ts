import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { promotions as promotionsTable } from "../src/lib/schema";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined in .env");
  process.exit(1);
}

const neonSql = neon(connectionString);
const db = drizzle(neonSql);

const initialPromotions = [
  {
    id: "promo-flash-sale",
    tag: "ĐANG DIỄN RA: FLASH SALE MÙA DU LỊCH",
    badge: "GIẢM ĐẾN 45%",
    title: "ĐẠI TIỆC ƯU ĐÃI",
    highlight: "BALO VIỆT PRO",
    description: "Giảm tới 45% toàn bộ các sản phẩm Balo Laptop & Du Lịch chống nước IPX6. Tặng kèm Áo Mưa Balo chuyên dụng trị giá 150.000đ cho đơn từ 990K.",
    code: "FLASHSALE45",
    discountValue: "Giảm 100.000đ",
    minOrder: "Đơn từ 699.000đ",
    giftText: "Tặng Áo mưa Balo 150K",
    ctaText: "SĂN DEAL NGAY",
    targetUrl: "/san-pham",
    imageUrl: "/hero-backpack.png",
    originalPrice: 1590000,
    salePrice: 990000,
    floatingPerks: [
      "Tặng Áo Mưa Balo 150K",
      "Chống nước chuẩn IPX6",
      "Bảo hành VIP 24 Tháng"
    ],
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "promo-welcome-member",
    tag: "ĐẶC QUYỀN THÀNH VIÊN MỚI",
    badge: "GIẢM 15% + FREESHIP",
    title: "QUÀ TẶNG BẠN MỚI",
    highlight: "GIẢM NGAY 15%",
    description: "Đăng ký thành viên nhận ngay voucher giảm 15% trực tiếp cho đơn hàng đầu tiên. Miễn phí giao hàng hỏa tốc 2H toàn quốc.",
    code: "WELCOME15",
    discountValue: "Giảm 15% (Tối đa 200K)",
    minOrder: "Áp dụng mọi sản phẩm",
    giftText: "Freeship hỏa tốc 2H",
    ctaText: "NHẬN MÃ 15% NGAY",
    targetUrl: "/dang-ky",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&h=1000&fit=crop",
    originalPrice: 1290000,
    salePrice: 1090000,
    floatingPerks: [
      "Freeship Toàn Quốc 0Đ",
      "Voucher 15% Không Giới Hạn",
      "Tích Điểm Đổi Quà VIP"
    ],
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "promo-combo-duo",
    tag: "COMBO SIÊU TIẾT KIỆM",
    badge: "TIẾT KIỆM 500.000Đ",
    title: "COMBO ĐÔI HÀNH TRÌNH",
    highlight: "MUA 2 GIẢM 500K",
    description: "Mua 1 Balo Laptop Công Sở + 1 Balo Du Lịch bất kỳ, giảm trực tiếp 500.000đ. Tặng kèm Túi Đeo Chéo EDC chống nước cao cấp trị giá 250K.",
    code: "COMBODUO",
    discountValue: "Giảm thêm 200.000đ",
    minOrder: "Khi mua từ 2 sản phẩm",
    giftText: "Tặng Túi EDC 250K",
    ctaText: "CHỌN COMBO NGAY",
    targetUrl: "/san-pham",
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=900&h=1000&fit=crop",
    originalPrice: 2480000,
    salePrice: 1980000,
    floatingPerks: [
      "Tặng Túi Đeo Chéo 250K",
      "Tiết kiệm ngay 500.000đ",
      "Bảo Hành Vàng 36 Tháng"
    ],
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "promo-eco-tradein",
    tag: "HÀNH TRÌNH XANH - VÌ MÔI TRƯỜNG",
    badge: "TRỢ GIÁ 200.000Đ",
    title: "THU CŨ ĐỔI MỚI",
    highlight: "TRỢ GIÁ 200K",
    description: "Đổi balo cũ bất kỳ nhận ngay voucher trợ giá 200.000đ nâng cấp lên dòng Balo Việt chất liệu vải sợi tái chế 900D siêu bền bỉ.",
    code: "ECO200",
    discountValue: "Trợ giá 200.000đ",
    minOrder: "Đơn từ 799.000đ",
    giftText: "Móc khóa da thủ công",
    ctaText: "THAM GIA ĐỔI CŨ",
    targetUrl: "/san-pham",
    imageUrl: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=900&h=1000&fit=crop",
    originalPrice: 1450000,
    salePrice: 1250000,
    floatingPerks: [
      "Vải Tái Chế Eco 900D",
      "Móc Khóa Da Khắc Tên",
      "Trợ Giá 200.000đ Trực Tiếp"
    ],
    sortOrder: 4,
    isActive: true,
  }
];

async function main() {
  console.log("Creating promotions table if not exists...");
  await neonSql`
    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      tag TEXT NOT NULL,
      badge TEXT NOT NULL,
      title TEXT NOT NULL,
      highlight TEXT NOT NULL,
      description TEXT NOT NULL,
      code TEXT,
      discount_value TEXT,
      min_order TEXT,
      gift_text TEXT,
      cta_text TEXT DEFAULT 'SĂN DEAL NGAY',
      target_url TEXT DEFAULT '/san-pham',
      image_url TEXT NOT NULL,
      original_price INTEGER,
      sale_price INTEGER,
      floating_perks TEXT[],
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log("Table created or verified!");

  console.log("Seeding initial promotions...");
  for (const promo of initialPromotions) {
    await db.insert(promotionsTable).values(promo).onConflictDoUpdate({
      target: promotionsTable.id,
      set: {
        tag: promo.tag,
        badge: promo.badge,
        title: promo.title,
        highlight: promo.highlight,
        description: promo.description,
        code: promo.code,
        discountValue: promo.discountValue,
        minOrder: promo.minOrder,
        giftText: promo.giftText,
        ctaText: promo.ctaText,
        targetUrl: promo.targetUrl,
        imageUrl: promo.imageUrl,
        originalPrice: promo.originalPrice,
        salePrice: promo.salePrice,
        floatingPerks: promo.floatingPerks,
        sortOrder: promo.sortOrder,
        isActive: promo.isActive,
        updatedAt: new Date(),
      }
    });
    console.log(`- Upserted: ${promo.title} (${promo.id})`);
  }

  console.log("Done initializing promotions!");
}

main().catch(console.error);
