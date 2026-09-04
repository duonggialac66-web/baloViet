# Kế hoạch Nâng cấp Toàn diện – Balo Việt
## ✅ Đã xác nhận: Next.js 15 + Neon + Cloudinary + Gemini AI

---

## Quyết định kiến trúc

| Hạng mục | Quyết định |
|----------|-----------|
| **Framework** | Next.js 15 App Router (từ Vite) – SEO tốt nhất |
| **Thương hiệu** | Giữ nguyên **Balo Việt** |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Ảnh** | Cloudinary (auto-WebP, auto-compress, responsive srcset) |
| **AI Search** | Gemini `text-embedding-004` + pgvector (Neon) |
| **Styling** | Tailwind CSS v4 (giữ nguyên) |
| **UI Target** | PackX-inspired: dark premium, yellow `#F5B800` accent |

---

## Proposed Changes

### 🔧 Phase 1 – Next.js Migration & Project Setup

---

#### [DELETE] Toàn bộ cấu hình Vite
- `vite.config.ts`, `.mise.toml` (cập nhật)
- `src/main.tsx`, `src/App.tsx`, `src/routes.ts` → thay bằng Next.js App Router

#### [NEW] Khởi tạo Next.js 15 trong cùng thư mục `D:\Lac`

```bash
# Giữ nguyên src/data, src/components, src/store
# Tạo cấu trúc Next.js mới
npx create-next-app@latest ./ --typescript --tailwind --app --src-dir --no-eslint
```

**Cấu trúc thư mục sau migration:**
```
D:\Lac/
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── layout.tsx                ← Root layout (thay Root.tsx)
│   │   ├── page.tsx                  ← Home (thay Home.tsx)
│   │   ├── san-pham/
│   │   │   ├── page.tsx              ← ProductListing
│   │   │   └── [slug]/page.tsx       ← ProductDetail (SSG)
│   │   ├── danh-muc/[slug]/page.tsx  ← CategoryPage (SSG)
│   │   ├── blog/
│   │   │   ├── page.tsx              ← Blog listing
│   │   │   └── [slug]/page.tsx       ← Blog detail
│   │   ├── ve-chung-toi/page.tsx
│   │   ├── lien-he/page.tsx
│   │   ├── sitemap.ts                ← Auto sitemap
│   │   ├── robots.ts                 ← robots.txt
│   │   └── api/
│   │       ├── products/route.ts
│   │       ├── search/route.ts
│   │       └── newsletter/route.ts
│   ├── components/                   ← Giữ nguyên, refactor
│   ├── data/                         ← Giữ tạm, xóa sau khi migrate DB
│   ├── lib/
│   │   ├── db.ts                     ← Neon + Drizzle client
│   │   ├── schema.ts                 ← Database schema
│   │   ├── cloudinary.ts             ← Cloudinary URL builder
│   │   ├── embeddings.ts             ← Gemini embedding
│   │   └── seo.ts                    ← SEO helpers
│   └── store/                        ← Giữ nguyên (cart context)
├── public/
│   └── (static assets)
├── .env.local                        ← Credentials
├── next.config.ts
├── drizzle.config.ts
└── package.json
```

---

#### [NEW] `.env.local`

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# App
NEXT_PUBLIC_SITE_URL="https://baloviet.vn"
```

---

### 🗄️ Phase 2 – Database Schema (Neon + Drizzle)

---

#### [NEW] `src/lib/schema.ts`

```typescript
import { pgTable, text, integer, real, boolean, 
         timestamp, jsonb, vector, index } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),           // "bv-001"
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  price: integer("price").notNull(),      // VND (no decimals)
  salePrice: integer("sale_price"),
  categorySlug: text("category_slug").notNull(),
  stock: integer("stock").notNull().default(0),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  specifications: jsonb("specifications").$type<Record<string, string>>(),
  tags: text("tags").array(),
  colors: jsonb("colors").$type<{name: string; hex: string}[]>(),
  isBestSeller: boolean("is_best_seller").default(false),
  isNew: boolean("is_new").default(false),
  // Cloudinary public IDs (không phải full URL)
  imageIds: text("image_ids").array(),    // ["products/bv-001/main", ...]
  imageAlts: text("image_alts").array(),
  // AI embedding (Gemini text-embedding-004 = 768 dimensions)
  embedding: vector("embedding", { dimensions: 768 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("products_slug_idx").on(table.slug),
  categoryIdx: index("products_category_idx").on(table.categorySlug),
  embeddingIdx: index("products_embedding_idx")
    .using("ivfflat", table.embedding.op("vector_cosine_ops")),
}));

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageId: text("image_id"),       // Cloudinary public ID
  imageAlt: text("image_alt"),
  count: integer("count").notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),         // Markdown/HTML
  imageId: text("image_id"),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});
```

#### [NEW] `src/lib/db.ts`

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

#### [NEW] `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

---

### 🖼️ Phase 3 – Cloudinary Integration

---

#### [NEW] `src/lib/cloudinary.ts`

```typescript
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif";
  crop?: "fill" | "fit" | "thumb";
}

export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  const { width, height, quality = "auto", format = "auto", crop = "fill" } = options;
  
  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ].filter(Boolean).join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

// Tạo srcset cho responsive images
export function buildSrcSet(publicId: string, widths = [400, 800, 1200]) {
  return widths
    .map(w => `${buildCloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(", ");
}
```

#### [NEW] `src/components/CloudinaryImage.tsx`

```tsx
"use client";
import { buildCloudinaryUrl, buildSrcSet } from "@/lib/cloudinary";
import { useState } from "react";

interface Props {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function CloudinaryImage({ publicId, alt, width, height, priority, className, sizes }: Props) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#1E2022] animate-pulse" />
      )}
      <img
        src={buildCloudinaryUrl(publicId, { width, height })}
        srcSet={buildSrcSet(publicId)}
        sizes={sizes ?? `(max-width: 768px) 100vw, ${width}px`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
```

---

### 🔍 Phase 4 – SEO Architecture

---

#### [NEW] `src/app/layout.tsx` – Root Metadata

```tsx
import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

// Next.js tự động inject vào <head>
export const metadata: Metadata = {
  metadataBase: new URL("https://baloviet.vn"),
  title: {
    template: "%s | Balo Việt",
    default: "Balo Việt – Balo Laptop, Du lịch, Học sinh Cao Cấp",
  },
  description: "Balo Việt – thương hiệu balo chính hãng Việt Nam. Balo laptop chống nước, balo du lịch 40L, balo học sinh bền đẹp. Bảo hành 24 tháng, giao hàng toàn quốc.",
  keywords: ["balo việt", "balo laptop", "balo du lịch", "balo học sinh", "balo chống nước"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Balo Việt",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "https://baloviet.vn" },
  robots: { index: true, follow: true },
};
```

#### [NEW] `src/app/san-pham/[slug]/page.tsx` – Product Page SSG + SEO

```tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/utils";

// ✅ SSG: Next.js pre-renders tất cả product pages tại build time
export async function generateStaticParams() {
  const allProducts = await db.select({ slug: products.slug }).from(products);
  return allProducts.map(p => ({ slug: p.slug }));
}

// ✅ Per-page metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, params.slug),
  });
  if (!product) return { title: "Không tìm thấy" };

  const imageUrl = product.imageIds?.[0]
    ? buildCloudinaryUrl(product.imageIds[0], { width: 1200, height: 630 })
    : undefined;

  return {
    title: `${product.name} – ${formatPrice(product.salePrice ?? product.price)}`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : [],
    },
    alternates: {
      canonical: `https://baloviet.vn/san-pham/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, params.slug),
  });

  // JSON-LD Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageIds?.map(id => buildCloudinaryUrl(id, { width: 800 })),
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", "name": "Balo Việt" },
    offers: {
      "@type": "Offer",
      price: (product.salePrice ?? product.price).toString(),
      priceCurrency: "VND",
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://baloviet.vn/san-pham/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviews.toString(),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Product UI ... */}
    </>
  );
}
```

#### [NEW] `src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products, categories, blogPosts } from "@/lib/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = "https://baloviet.vn";

  const allProducts = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products);
  const allCategories = await db.select({ slug: categories.slug }).from(categories);
  const allPosts = await db.select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt }).from(blogPosts);

  return [
    { url: BASE, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/san-pham`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/ve-chung-toi`, priority: 0.6 },
    { url: `${BASE}/lien-he`, priority: 0.5 },

    // All products
    ...allProducts.map(p => ({
      url: `${BASE}/san-pham/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),

    // All categories
    ...allCategories.map(c => ({
      url: `${BASE}/danh-muc/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // All blog posts
    ...allPosts.map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
```

#### [NEW] `src/app/robots.ts`

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tai-khoan", "/gio-hang", "/thanh-toan", "/api/"],
    },
    sitemap: "https://baloviet.vn/sitemap.xml",
  };
}
```

---

### 🤖 Phase 5 – AI Semantic Search (Gemini + pgvector)

---

#### [NEW] `src/lib/embeddings.ts`

```typescript
import { GoogleGenerativeAI } from "@google/genai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genai.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // 768 dimensions
}

// Tạo embedding text từ product (dùng để index)
export function productToEmbeddingText(product: {
  name: string;
  description: string;
  tags: string[];
  category: string;
}): string {
  return [
    product.name,
    product.description,
    product.tags.join(", "),
    product.category,
  ].join(". ");
}
```

#### [NEW] `src/app/api/search/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { generateEmbedding } from "@/lib/embeddings";
import { sql, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  // 1. Full-text search (nhanh, chính xác từ khóa)
  const keywordResults = await db.select().from(products)
    .where(or(
      ilike(products.name, `%${query}%`),
      ilike(products.shortDescription, `%${query}%`),
    ))
    .limit(5);

  // 2. Semantic search (chậm hơn, hiểu ngữ nghĩa)
  const embedding = await generateEmbedding(query);
  const semanticResults = await db.execute(sql`
    SELECT *, 1 - (embedding <=> ${JSON.stringify(embedding)}::vector) AS similarity
    FROM products
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
    LIMIT 8
  `);

  // 3. Merge & deduplicate
  const merged = [...keywordResults];
  for (const row of semanticResults.rows) {
    if (!merged.find(p => p.id === row.id)) {
      merged.push(row as any);
    }
  }

  return NextResponse.json({ products: merged.slice(0, 8) });
}
```

---

### 🎨 Phase 6 – UI Redesign (PackX Style)

---

#### [MODIFY] `src/index.css` – Thêm animations & tokens

```css
/* Thêm Barlow Condensed weight 900 */
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700&family=Inter:wght@300;400;500;600&display=swap');

/* Scroll-reveal animation */
@keyframes revealUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal-up {
  animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.reveal-delay-1 { animation-delay: 0.1s; }
.reveal-delay-2 { animation-delay: 0.2s; }
.reveal-delay-3 { animation-delay: 0.3s; }

/* Hero text grain overlay */
.hero-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.04;
  pointer-events: none;
}
```

---

#### [MODIFY] `src/components/Header.tsx` – PackX-style

**Thay đổi:**
- Logo: `BALO` (white) + `VIỆT` (gold) – giữ nguyên font Barlow Black
- Tagline dưới: *"ĐỒNG HÀNH TRÊN MỌI HÀNH TRÌNH"* italic nhỏ
- Nav active: underline vàng (✅ đã có)
- Sticky header: `bg-[#0B0D0E]/90 backdrop-blur-md` khi scroll

---

#### [MODIFY] `src/app/page.tsx` (Home) – Toàn bộ redesign

**Hero Section:**
```
Dark full-screen (#0B0D0E)
┌──────────────────┬──────────────┬─────────────────────┐
│                  │              │  ┌─────────────────┐ │
│ FOCUS ON         │  [Hero Bag   │  │ 🖼 Vải chống nước│ │
│ WHAT MATTERS.    │   Image -    │  ├─────────────────┤ │
│ We carry         │   centered   │  │ 🖼 Ngăn Laptop   │ │
│  the rest.       │   with glow] │  ├─────────────────┤ │
│                  │              │  │ 🖼 Cổng sạc USB  │ │
│ Sub text…        │              │  ├─────────────────┤ │
│                  │              │  │ 🖼 Lưng êm ái    │ │
│ [KHÁM PHÁ→] [▶] │              │  └─────────────────┘ │
│                  │              │                       │
│              01 ○─○ 02  03  04  ← →                    │
└──────────────────┴──────────────┴─────────────────────┘
│ 💧 Chống nước │ 💻 Ngăn Laptop │ 🛡 Bảo hành │ 🔄 Đổi trả │
```

**Chi tiết kỹ thuật Hero:**
- H1: `FOCUS ON WHAT MATTERS.` – `clamp(3.5rem, 7vw, 6.5rem)`, Barlow Condensed 900
- Italic tagline: `We carry the rest.` – `text-[#F5B800]`, cursive-italic Barlow
- Callout cards bên phải: thumbnail nhỏ Cloudinary + text label (như PackX)
- Hero slideshow indicators: `01 02 03 04` với dots + arrows `‹ ›`
- Yellow glow behind product image: `bg-[#F5B800]/15 blur-3xl`
- Trust bar bottom: icons + label/sublabel, 4 cột, border top vàng nhạt

**Categories Section:**
```
Light section (#F3F1EB)
CHỌN BALO THEO PHONG CÁCH        ┌─────────────────┐
──────────────────────            │  BẠN SẼ ĐI ĐÂU? │
                                  │  Trả lời 3 câu  │
[Laptop][Du lịch][Học sinh]      │  hỏi...         │
[Thời trang][Chống nước]         │  [BẮT ĐẦU NGAY→]│
                                  └─────────────────┘
```
- 5 category images (aspect 3:4) hover scale + gold arrow
- Black "Bạn sẽ đi đâu?" panel cạnh bên phải

**Featured Products:**
```
Dark section (#0B0D0E)
SẢN PHẨM NỔI BẬT          [‹] [›]  XEM TẤT CẢ →

[Best][Card][Card][Card][Card]  ─scroll─▶
```
- Horizontal scroll, nút arrow tròn vàng
- Badge: `TỐT NHẤT` (gold), `MỚI` (white), `-30%` (red)

**Stats Bar:**
```
#161819 background
│ 👥 10.000+        │ ⭐ 4.9/5        │ 🚚 MIỄN PHÍ      │ 🛡 24 THÁNG      │
│ Khách hàng        │ Đánh giá        │ Giao hàng         │ Bảo hành          │
```

**Journey Section:**
```
Dark (#0B0D0E) – 4 images 2x2 → 1x4 desktop
┌──────┬──────┬──────┬──────┐
│ ĐI   │ ĐI   │ DU   │PHƯỢT │
│ LÀM  │ HỌC  │ LỊCH │      │
│      →│      →│      →│     →│
└──────┴──────┴──────┴──────┘
```

**Footer (5 cols):**
```
BALO    │ ĐĂNG KÝ    │ VỀ CHÚNG │ HỖ TRỢ   │ THÔNG TIN │ LIÊN HỆ
VIỆT    │ NHẬN TIN   │ TÔI      │           │           │
        │[email  ][→]│ Giới thiệu│ Mua hàng │ Blog      │ ☎ 1900
[FB][IG]│            │ Câu chuyện│ FAQ       │ Tin tức   │ ✉ email
[TT][YT]│            │ Tuyển dụng│ Đổi trả  │           │ 📍 địa chỉ
```

---

#### [MODIFY] `src/components/ProductCard.tsx` – PackX card design

```tsx
// Thay đổi:
// - Background: #1C1E20 (card), hover border vàng
// - Badge overlay: "TỐT NHẤT" vàng / "MỚI" trắng / "-X%" đỏ
// - Giá sale: gạch ngang giá gốc màu muted, giá sale màu gold
// - Rating: stars vàng inline
// - Add-to-cart: button tròn vàng ở corner, hover expand
// - Hover: translateY(-4px) + box-shadow vàng nhẹ
```

---

### 📦 Phase 7 – Dependencies & Scripts

---

#### [MODIFY] `package.json`

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@neondatabase/serverless": "^0.10.0",
    "drizzle-orm": "^0.39.0",
    "@cloudinary/url-gen": "^1.21.0",
    "@google/genai": "^1.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "drizzle-kit": "^0.30.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "npx tsx scripts/seed.ts"
  }
}
```

---

### 📋 Migration Script

#### [NEW] `scripts/seed.ts` – Migrate data từ static files → Neon DB

```typescript
// 1. Đọc products từ src/data/products.ts
// 2. Generate Gemini embeddings cho mỗi sản phẩm
// 3. Insert vào Neon DB
// 4. Log kết quả

import { db } from "../src/lib/db";
import { products as productsTable } from "../src/lib/schema";
import { products } from "../src/data/products";
import { generateEmbedding, productToEmbeddingText } from "../src/lib/embeddings";

async function seed() {
  console.log("🌱 Seeding database...");
  
  for (const product of products) {
    const embeddingText = productToEmbeddingText({
      name: product.name,
      description: product.description,
      tags: product.tags,
      category: product.category,
    });
    
    const embedding = await generateEmbedding(embeddingText);
    
    await db.insert(productsTable).values({
      ...product,
      // Convert Unsplash URLs → Cloudinary public IDs
      // (sau khi upload ảnh lên Cloudinary)
      imageIds: [`products/${product.id}/main`],
      imageAlts: product.images.map(img => img.alt),
      embedding,
    }).onConflictDoNothing();
    
    console.log(`✅ ${product.name}`);
  }
  
  console.log("✅ Seeding complete!");
}

seed();
```

---

## Verification Plan

### Build & Deploy Checks
```bash
next build   # Phải pass không có errors
```

### SEO Validation
| Tool | URL | Target |
|------|-----|--------|
| PageSpeed Insights | `/san-pham/balo-viet-explorer-pro` | LCP < 2.5s, CLS < 0.1 |
| Rich Results Test | `/san-pham/{slug}` | Product schema valid |
| Sitemap validator | `/sitemap.xml` | Tất cả URLs accessible |
| Mobile-Friendly Test | Homepage | Pass |

### Database Checks
```bash
# Verify pgvector installed
SELECT extname FROM pg_extension WHERE extname = 'vector';

# Verify embeddings populated
SELECT COUNT(*) FROM products WHERE embedding IS NOT NULL;

# Test semantic search
SELECT name, 1-(embedding <=> '[...]'::vector) AS score 
FROM products ORDER BY 2 DESC LIMIT 5;
```

---

## Thứ tự thực hiện (theo phases)

```
Phase 1: Next.js migration + folder structure         (30 phút)
Phase 2: Neon DB schema + Drizzle setup               (45 phút)
Phase 3: Cloudinary helpers + CloudinaryImage          (20 phút)
Phase 4: SEO – layout.tsx, generateMetadata, sitemap  (45 phút)
Phase 5: AI Search – embeddings + API route           (30 phút)
Phase 6: UI Redesign – Home, Header, ProductCard      (2-3 giờ)
Phase 7: Seed script – migrate data to Neon           (20 phút)
Phase 8: Verify – Lighthouse, Rich Results, GSC       (30 phút)
```

> **Tổng ước tính: ~6-8 giờ làm việc**

---

> [!IMPORTANT]
> Trước khi bắt đầu, hãy cung cấp:
> 1. `DATABASE_URL` từ Neon dashboard
> 2. `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
> 3. `GEMINI_API_KEY` (nếu muốn AI search)
>
> Hoặc tạo file `.env.local` với các giá trị trên và đặt vào `D:\Lac\.env.local`
