import { db } from "@/lib/db";
import { 
  products as productsSchema, 
  promotions as promotionsSchema,
  categories as categoriesSchema,
  uiConfigs as uiConfigsSchema
} from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryStyleSlider, { type CategoryItem } from "@/components/home/CategoryStyleSlider";
import BrandGuaranteeSection, { type BrandGuaranteeConfig } from "@/components/home/BrandGuaranteeSection";
import type { Product } from "@/data/products";

export default async function Home() {
  let dbProducts: any[] = [];
  let activePromotions: any[] = [];
  let dbCategories: any[] = [];
  let dbUiConfigs: any[] = [];

  try {
    const [prods, promos, cats, uis] = await Promise.all([
      db.select().from(productsSchema).orderBy(desc(productsSchema.createdAt)),
      db.select().from(promotionsSchema).where(eq(promotionsSchema.isActive, true)).orderBy(asc(promotionsSchema.sortOrder)),
      db.select().from(categoriesSchema),
      db.select().from(uiConfigsSchema),
    ]);
    dbProducts = prods;
    activePromotions = promos;
    dbCategories = cats;
    dbUiConfigs = uis;
  } catch (err) {
    console.warn("Could not query data from database:", err);
  }

  // Format products for frontend components
  const formattedProducts: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    category: p.categorySlug === "balo-laptop" ? "Balo Laptop" :
              p.categorySlug === "balo-du-lich" ? "Balo Du Lịch" :
              p.categorySlug === "balo-hoc-sinh" ? "Balo Học Sinh" :
              p.categorySlug === "balo-thoi-trang" ? "Balo Thời Trang" :
              p.categorySlug === "balo-chong-nuoc" ? "Balo Chống Nước" : "Balo Cao Cấp",
    categorySlug: p.categorySlug,
    stock: p.stock,
    rating: p.rating,
    reviews: p.reviews,
    shortDescription: p.shortDescription,
    description: p.description,
    specifications: (p.specifications as Record<string, string>) || {},
    tags: p.tags || [],
    images: (p.imageIds || []).map((url: string, index: number) => ({
      url,
      alt: p.imageAlts?.[index] || p.name,
      thumbnail: url,
    })),
    colors: (p.colors as { name: string; hex: string }[]) || [{ name: "Đen", hex: "#000000" }],
    isBestSeller: p.isBestSeller ?? false,
    isNew: p.isNew ?? false,
  }));

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
