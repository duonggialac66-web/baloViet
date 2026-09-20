import { db } from "@/lib/db";
import { 
  products as productsSchema, 
  promotions as promotionsSchema,
  categories as categoriesSchema,
  uiConfigs as uiConfigsSchema
} from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { productListColumns, formatProductForCard } from "@/lib/queries";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryStyleSlider, { type CategoryItem } from "@/components/home/CategoryStyleSlider";
import BrandGuaranteeSection, { type BrandGuaranteeConfig } from "@/components/home/BrandGuaranteeSection";
import type { Product } from "@/data/products";

export const revalidate = 60;

/**
 * Cache toàn bộ dữ liệu trang chủ vào bộ nhớ server.
 * - Lần đầu: query DB (~50-100ms)
 * - Các lần sau trong 60s: trả từ cache (~1-3ms)
 * - Tự động refresh sau 60s hoặc khi gọi revalidateTag("homepage")
 */
const getHomepageData = unstable_cache(
  async () => {
    const [prods, promos, cats, uis] = await Promise.all([
      db.select(productListColumns).from(productsSchema).orderBy(desc(productsSchema.createdAt)).limit(8),
      db.select().from(promotionsSchema).where(eq(promotionsSchema.isActive, true)).orderBy(asc(promotionsSchema.sortOrder)),
      db.select().from(categoriesSchema),
      db.select().from(uiConfigsSchema),
    ]);
    return { products: prods, promotions: promos, categories: cats, uiConfigs: uis };
  },
  ["homepage-data"],
  { revalidate: 60, tags: ["homepage", "products", "promotions", "categories"] }
);

export default async function Home() {
  let dbProducts: any[] = [];
  let activePromotions: any[] = [];
  let dbCategories: any[] = [];
  let dbUiConfigs: any[] = [];

  try {
    const data = await getHomepageData();
    dbProducts = data.products;
    activePromotions = data.promotions;
    dbCategories = data.categories;
    dbUiConfigs = data.uiConfigs;
  } catch (err) {
    console.warn("Could not query data from database:", err);
  }

  // Format products for frontend components (using shared helper)
  const formattedProducts: Product[] = dbProducts.map(formatProductForCard);

  // Format categories with UI configs for CategoryStyleSlider
  const sliderCategories: CategoryItem[] = dbCategories.map((c) => {
    const ui = dbUiConfigs.find((u) => u.targetId === c.slug) || {};
    return {
      id: c.id,
      name: c.name.toUpperCase(),
      slug: c.slug,
      description: c.description || "",
      image: c.imageId || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&h=800&fit=crop",
      count: c.count,
      rating: 4.9,
      reviews: 500,
      spec: ui.spec || "Chất lượng cao",
      badge: ui.badge || "HOT",
      gradient: ui.gradient || "from-cyan-900/60 via-slate-900/80 to-[#0B0D0E]",
      glowColor: ui.glowColor || "rgba(6, 182, 212, 0.35)",
      shapeClass: ui.shapeClass || "rounded-2xl",
    };
  });

  // Extract policy config from uiConfigs
  let policyConfig: BrandGuaranteeConfig | undefined = undefined;
  const policyUi = dbUiConfigs.find((u) => u.id === "home_guarantee_policy");
  if (policyUi && policyUi.spec) {
    try {
      policyConfig = JSON.parse(policyUi.spec);
    } catch {
      // fallback
    }
  }

  return (
    <main>
      {/* === 1. HERO CAROUSEL (Database-driven Promotions) === */}
      <HeroSection initialPromotions={activePromotions} />

      {/* === 2. FEATURED PRODUCTS === */}
      <FeaturedProducts products={formattedProducts} />

      {/* === 3. CATEGORIES 3D SHOWCASE === */}
      <CategoryStyleSlider initialCategories={sliderCategories} />

      {/* === 4. BRAND GUARANTEE & STORY (Admin Configurable) === */}
      <BrandGuaranteeSection initialData={policyConfig} />
    </main>
  );
}

