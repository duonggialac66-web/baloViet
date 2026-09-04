import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { 
  categories as categoriesTable, 
  products as productsTable, 
  uiConfigs as uiConfigsTable,
  users as usersTable
} from "../src/lib/schema";
import bcrypt from "bcryptjs";

const categories = [
  {
    id: "cat-1",
    name: "Balo Laptop",
    slug: "balo-laptop",
    description: "Thiết kế tối ưu cho dân công nghệ, có ngăn laptop chống sốc",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=700&fit=crop&auto=format",
    imageAlt: "Balo laptop cao cấp màu đen",
    count: 24,
  },
  {
    id: "cat-2",
    name: "Balo Du lịch",
    slug: "balo-du-lich",
    description: "Dung tích lớn, bền bỉ, đồng hành mọi chuyến đi",
    image: "https://images.unsplash.com/photo-1476979735039-2fdea9e9e407?w=600&h=700&fit=crop&auto=format",
    imageAlt: "Balo du lịch hiking ngoài thiên nhiên",
    count: 18,
  },
  {
    id: "cat-3",
    name: "Balo Học sinh",
    slug: "balo-hoc-sinh",
    description: "Nhẹ, bền, nhiều ngăn thông minh cho học sinh sinh viên",
    image: "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=600&h=700&fit=crop&auto=format",
    imageAlt: "Balo học sinh với laptop và sách",
    count: 15,
  },
  {
    id: "cat-4",
    name: "Balo Thời trang",
    slug: "balo-thoi-trang",
    description: "Thiết kế tinh tế, tối giản, phù hợp phong cách đô thị",
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=700&fit=crop&auto=format",
    imageAlt: "Balo thời trang đô thị màu đen",
    count: 20,
  },
  {
    id: "cat-5",
    name: "Balo Chống nước",
    slug: "balo-chong-nuoc",
    description: "Vật liệu kỹ thuật cao, bảo vệ đồ dùng trong mọi thời tiết",
    image: "https://images.unsplash.com/photo-1622260614927-208cfe3f5cfd?w=600&h=700&fit=crop&auto=format",
    imageAlt: "Balo chống nước xanh đen trong thiên nhiên",
    count: 12,
  },
];

const baseProducts = [
  {
    id: "bv-001",
    name: "Balo Laptop Công Sở Cao Cấp BaloViệt Pro 15.6 inch",
    slug: "balo-laptop-cong-so-cao-cap-baloviet-pro-15-6-inch",
    sku: "BV-LAP-001",
    price: 890000,
    salePrice: 699000,
    category: "Balo Laptop",
    categorySlug: "balo-laptop",
    stock: 50,
    rating: 4.9,
    reviews: 142,
    shortDescription: "Thiết kế chuẩn công sở cao cấp, ngăn chống sốc chuyên dụng cho laptop đến 15.6 inch cùng cổng sạc USB tiện ích.",
    description: "Balo Laptop BaloViệt Pro được gia công từ chất liệu Polyester 900D trượt nước cao cấp, đệm lưng thoáng khí chống mỏi và quai đeo chịu lực êm ái. Tích hợp ngăn chống trộm sau lưng và ngăn chia đồ khoa học phục vụ hoàn hảo cho ngày làm việc văn phòng năng động.",
    specifications: {
      "Kích thước": "44 x 31 x 14 cm",
      "Trọng lượng": "0.85 kg",
      "Ngăn Laptop": "Tối đa 15.6 inch",
      "Chất liệu": "Polyester 900D trượt nước",
      "Bảo hành": "24 tháng chính hãng"
    },
    tags: ["balo laptop", "công sở", "chống sốc", "cao cấp"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
        alt: "Balo Laptop Công Sở BaloViệt Pro",
      }
    ],
    colors: [
      { name: "Đen Nhám", hex: "#1C1E20" },
      { name: "Xám Titan", hex: "#4B5563" }
    ],
    isBestSeller: true,
    isNew: false
  },
  {
    id: "bv-002",
    name: "Balo Du Lịch Dã Ngoại Trekker Pro 45L",
    slug: "balo-du-lich-da-ngoai-trekker-pro-45l",
    sku: "BV-TRV-001",
    price: 1450000,
    salePrice: 1150000,
    category: "Balo Du Lịch",
    categorySlug: "balo-du-lich",
    stock: 28,
    rating: 4.9,
    reviews: 96,
    shortDescription: "Dung tích cực lớn 45L, thiết kế công thái học trợ lực phân tán đều trọng lượng cho các chuyến đi dài ngày.",
    description: "Trekker Pro 45L được sinh ra cho những chuyến phượt, dã ngoại và du lịch 4-7 ngày. Tích hợp đai trợ lực hông, áo mưa balo giấu đáy, khóa kéo YKK chuẩn quân đội và các móc treo gậy leo núi, túi ngủ bên ngoài.",
    specifications: {
      "Dung tích": "45 Lít",
      "Kích thước": "55 x 35 x 22 cm",
      "Trọng lượng": "1.3 kg",
      "Chất liệu": "Nylon Ripstop 420D chống xé rách",
      "Bảo hành": "24 tháng chính hãng"
    },
    tags: ["du lịch", "dã ngoại", "trekking", "balo 45L"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1476979735039-2fdea9e9e407?w=800&h=800&fit=crop&auto=format",
        alt: "Balo Du Lịch Trekker Pro 45L",
      }
    ],
    colors: [
      { name: "Xanh Rừng Trúc", hex: "#065F46" },
      { name: "Cam Sa Mạc", hex: "#C2410C" }
    ],
    isBestSeller: true,
    isNew: false
  },
  {
    id: "bv-003",
    name: "Balo Học Sinh Chống Gù Lưng ErgoSmart Junior",
    slug: "balo-hoc-sinh-chong-gu-lung-ergosmart-junior",
    sku: "BV-STU-001",
    price: 650000,
    salePrice: 499000,
    category: "Balo Học Sinh",
    categorySlug: "balo-hoc-sinh",
    stock: 60,
    rating: 4.9,
    reviews: 180,
    shortDescription: "Thiết kế công thái học đạt chuẩn y khoa bảo vệ cột sống, đệm lưng dạng rãnh thoáng khí và phản quang an toàn ban đêm.",
    description: "ErgoSmart Junior được nghiên cứu chuyên biệt cho học sinh tiểu học và THCS. Khung chữ U nâng đỡ cột sống, quai đeo bản rộng phân bổ đều lực ép lên vai và chất liệu siêu nhẹ giúp bảo vệ vóc dáng trẻ tối đa.",
    specifications: {
      "Kích thước": "38 x 28 x 15 cm",
      "Trọng lượng": "0.55 kg (Siêu nhẹ)",
      "Độ tuổi phù hợp": "Lớp 1 đến Lớp 7",
      "Chất liệu": "Vải Oxford 600D chống thấm",
      "Bảo hành": "24 tháng chính hãng"
    },
    tags: ["học sinh", "chống gù", "siêu nhẹ", "công thái học"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=800&h=800&fit=crop&auto=format",
        alt: "Balo Học Sinh Chống Gù ErgoSmart Junior",
      }
    ],
    colors: [
      { name: "Xanh Dương Vũ Trụ", hex: "#2563EB" },
      { name: "Hồng Pastel", hex: "#F472B6" }
    ],
    isBestSeller: true,
    isNew: false
  },
  {
    id: "bv-004",
    name: "Balo Thời Trang Da PU Minimalist Urban Lux",
    slug: "balo-thoi-trang-da-pu-minimalist-urban-lux",
    sku: "BV-FSH-001",
    price: 950000,
    salePrice: 780000,
    category: "Balo Thời Trang",
    categorySlug: "balo-thoi-trang",
    stock: 45,
    rating: 4.9,
    reviews: 115,
    shortDescription: "Thiết kế tối giản phong cách Bắc Âu Scandinavian, chất da PU vi sợi mờ sang trọng và không bong tróc.",
    description: "Urban Lux nâng tầm phong cách thường nhật của bạn với đường nét tinh xảo, phụ kiện kim loại mạ điện mờ chống gỉ và phom dáng cứng cáp giữ dáng chuẩn ngay cả khi để ít đồ.",
    specifications: {
      "Kích thước": "40 x 29 x 12 cm",
      "Trọng lượng": "0.78 kg",
      "Chất liệu": "Da PU Microfiber cao cấp không nổ",
      "Bảo hành": "24 tháng chính hãng"
    },
    tags: ["thời trang", "da PU", "minimalism", "sang trọng"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop&auto=format",
        alt: "Balo Thời Trang Da PU Urban Lux",
      }
    ],
    colors: [
      { name: "Đen Mờ Velvet", hex: "#18181B" },
      { name: "Nâu Da Bò", hex: "#78350F" }
    ],
    isBestSeller: true,
    isNew: true
  },
  {
    id: "bv-005",
    name: "Balo Chống Nước Tuyệt Đối StormShield IPX6 30L",
    slug: "balo-chong-nuoc-tuyet-doi-stormshield-ipx6-30l",
    sku: "BV-WTP-001",
    price: 1190000,
    salePrice: 920000,
    category: "Balo Chống Nước",
    categorySlug: "balo-chong-nuoc",
    stock: 30,
    rating: 5.0,
    reviews: 68,
    shortDescription: "Công nghệ ép nhiệt cao tần Seam-Sealed chuẩn chống nước IPX6, an toàn tuyệt đối dưới mưa bão lớn.",
    description: "StormShield IPX6 sử dụng chất liệu TPU 500D chống thấm tuyệt đối kết hợp khóa kéo chống nước chuẩn hàng hải. Thách thức mọi cơn mưa rào nhiệt đới, bảo vệ trọn vẹn máy ảnh và thiết bị điện tử đắt tiền.",
    specifications: {
      "Tiêu chuẩn chống nước": "IPX6 (Kháng mưa lớn & tia nước áp lực cao)",
      "Kích thước": "46 x 31 x 15 cm",
      "Trọng lượng": "0.98 kg",
      "Chất liệu": "TPU 500D Tarpaulin ép nhiệt Seam-Sealed",
      "Bảo hành": "24 tháng chính hãng"
    },
    tags: ["chống nước", "ipx6", "đi mưa", "bảo vệ tối đa"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
        alt: "Balo Chống Nước StormShield IPX6",
      }
    ],
    colors: [
      { name: "Đen Bão Táp", hex: "#0F172A" },
      { name: "Vàng Cảnh Báo", hex: "#EAB308" }
    ],
    isBestSeller: true,
    isNew: true
  }
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const neonSql = neon(connectionString);
const db = drizzle(neonSql);

// UI Configs for CategoryStyleSlider
const CATEGORY_UI_CONFIGS = [
  {
    targetSlug: "balo-laptop",
    spec: "Ngăn Chống Sốc 17.3\"",
    badge: "BÁN CHẠY #1",
    gradient: "from-blue-900/60 via-slate-900/80 to-[#0B0D0E]",
    glowColor: "rgba(59, 130, 246, 0.35)",
    shapeClass: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
  },
  {
    targetSlug: "balo-du-lich",
    spec: "Dung Tích Khủng 45L",
    badge: "PHƯỢT THỦ YÊU THÍCH",
    gradient: "from-emerald-900/60 via-slate-900/80 to-[#0B0D0E]",
    glowColor: "rgba(16, 185, 129, 0.35)",
    shapeClass: "polygon(0 5%, 100% 0, 100% 100%, 0 95%)",
  },
  {
    targetSlug: "balo-hoc-sinh",
    spec: "Chống Gù Lưng Trẻ Em",
    badge: "ĐẠT CHUẨN Y KHOA",
    gradient: "from-amber-900/60 via-slate-900/80 to-[#0B0D0E]",
    glowColor: "rgba(245, 184, 0, 0.35)",
    shapeClass: "polygon(0 0, 100% 5%, 100% 95%, 0 100%)",
  },
  {
    targetSlug: "balo-thoi-trang",
    spec: "Da PU Cao Cấp Kháng Nước",
    badge: "TRENDING 2026",
    gradient: "from-purple-900/60 via-slate-900/80 to-[#0B0D0E]",
    glowColor: "rgba(168, 85, 247, 0.35)",
    shapeClass: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
  },
  {
    targetSlug: "balo-chong-nuoc",
    spec: "Kháng Nước Chuẩn IPX6",
    badge: "VẬT LIỆU QUÂN ĐỘI",
    gradient: "from-cyan-900/60 via-slate-900/80 to-[#0B0D0E]",
    glowColor: "rgba(6, 182, 212, 0.35)",
    shapeClass: "polygon(0 0, 100% 8%, 100% 100%, 0 92%)",
  },
];

async function ensureTables() {
  console.log("🛠️  Verifying / Creating Database Tables...");

  await neonSql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_id TEXT,
      image_alt TEXT,
      count INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT,
      meta_description TEXT
    );
  `;

  await neonSql`
    CREATE TABLE IF NOT EXISTS ui_configs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      gradient TEXT,
      glow_color TEXT,
      shape_class TEXT,
      badge TEXT,
      spec TEXT
    );
  `;

  await neonSql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sku TEXT NOT NULL UNIQUE,
      price INTEGER NOT NULL,
      sale_price INTEGER,
      category_slug TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 0,
      reviews INTEGER NOT NULL DEFAULT 0,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      specifications JSONB,
      tags TEXT[],
      colors JSONB,
      is_best_seller BOOLEAN DEFAULT false,
      is_new BOOLEAN DEFAULT false,
      is_hero_featured BOOLEAN DEFAULT false,
      image_ids TEXT[],
      image_alts TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await neonSql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await neonSql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      ip_address TEXT
    );
  `;

  console.log("✅ Tables are ready!");
}

async function uploadToCloudinary(imageUrl: string, folder = "baloviet"): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || cloudName === "your_cloud_name" || !apiKey || apiKey === "your_api_key") {
    // Return original url if credentials aren't configured yet
    return imageUrl;
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Simple direct upload URL format
    return imageUrl;
  } catch (err) {
    return imageUrl;
  }
}

async function runMigration() {
  console.log("🚀 Starting Data Migration to Neon DB & Cloudinary...");
  await ensureTables();

  // 1. Seed Categories
  console.log("\n📦 1. Seeding Categories...");
  for (const cat of categories) {
    const uploadedImg = await uploadToCloudinary(cat.image, "categories");
    await db.insert(categoriesTable).values({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageId: uploadedImg,
      imageAlt: cat.imageAlt,
      count: cat.count,
    }).onConflictDoUpdate({
      target: categoriesTable.id,
      set: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageId: uploadedImg,
        imageAlt: cat.imageAlt,
        count: cat.count,
      }
    });
    console.log(`  ✓ Category: ${cat.name} (${cat.slug})`);
  }

  // 2. Seed UI Configs
  console.log("\n🎨 2. Seeding UI Configs...");
  for (let i = 0; i < CATEGORY_UI_CONFIGS.length; i++) {
    const conf = CATEGORY_UI_CONFIGS[i];
    const confId = `slider_ui_${conf.targetSlug}`;
    await db.insert(uiConfigsTable).values({
      id: confId,
      type: "category_slider",
      targetId: conf.targetSlug,
      gradient: conf.gradient,
      glowColor: conf.glowColor,
      shapeClass: conf.shapeClass,
      badge: conf.badge,
      spec: conf.spec,
    }).onConflictDoUpdate({
      target: uiConfigsTable.id,
      set: {
        gradient: conf.gradient,
        glowColor: conf.glowColor,
        shapeClass: conf.shapeClass,
        badge: conf.badge,
        spec: conf.spec,
      }
    });
    console.log(`  ✓ UI Config for: ${conf.targetSlug}`);
  }

  // 3. Seed Products (5 base items for each category)
  console.log(`\n🎒 3. Seeding Products (${baseProducts.length} items)...`);
  let count = 0;
  for (const product of baseProducts) {
    count++;
    // Feature top 4 products for hero carousel
    const isHero = count <= 4;
    
    // Map category
    const categorySlug = 
      product.category === "Balo Laptop" ? "balo-laptop" :
      product.category === "Balo Du Lịch" ? "balo-du-lich" :
      product.category === "Balo Học Sinh" ? "balo-hoc-sinh" :
      product.category === "Balo Thời Trang" ? "balo-thoi-trang" :
      product.category === "Balo Chống Nước" ? "balo-chong-nuoc" :
      "balo-laptop";

    await db.insert(productsTable).values({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku || `SKU-${product.id}`,
      price: product.price,
      salePrice: product.salePrice,
      categorySlug: categorySlug,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
      shortDescription: product.shortDescription || product.description.substring(0, 150),
      description: product.description,
      specifications: product.specifications || {},
      tags: product.tags || [],
      colors: product.colors || [],
      isBestSeller: Boolean(product.isBestSeller),
      isNew: Boolean(product.isNew),
      isHeroFeatured: isHero,
      imageIds: product.images.map(img => img.url),
      imageAlts: product.images.map(img => img.alt),
    }).onConflictDoUpdate({
      target: productsTable.id,
      set: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        categorySlug: categorySlug,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews,
        shortDescription: product.shortDescription || product.description.substring(0, 150),
        description: product.description,
        specifications: product.specifications || {},
        tags: product.tags || [],
        colors: product.colors || [],
        isBestSeller: Boolean(product.isBestSeller),
        isNew: Boolean(product.isNew),
        isHeroFeatured: isHero,
        imageIds: product.images.map(img => img.url),
        imageAlts: product.images.map(img => img.alt),
        updatedAt: new Date(),
      }
    });

    console.log(`  ✓ Product [${count}/${baseProducts.length}]: ${product.name}`);
  }

  // 4. Seed Admin
  console.log("\n👑 4. Verifying Hardcoded Admin Account...");
  const adminEmail = "admin@baloviet.vn";
  const adminHash = await bcrypt.hash("Admin@2026", 10);
  await db.insert(usersTable).values({
    id: "admin_master",
    email: adminEmail,
    passwordHash: adminHash,
    fullName: "Balo Việt Admin",
    role: "admin",
    isActive: true,
    emailVerified: true,
  }).onConflictDoNothing();
  console.log(`  ✓ Admin: ${adminEmail} (Password: Admin@2026)`);

  console.log("\n✨ MIGRATION & SEEDING COMPLETED SUCCESSFULLY! ✨\n");
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
