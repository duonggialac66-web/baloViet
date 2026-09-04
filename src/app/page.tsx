import { db } from "@/lib/db";
import { 
  products as productsSchema, 
  promotions as promotionsSchema,
  categories as categoriesSchema,
  uiConfigs as uiConfigsSchema
} from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ScrollReveal from "@/components/ScrollReveal";
import CategoryStyleSlider, { type CategoryItem } from "@/components/home/CategoryStyleSlider";
import type { Product } from "@/data/products";

// ... existing stats and journeyItems ...

// ... existing stats and journeyItems ...

const stats = [
  {
    value: "10.000+", label: "Khách hàng tin tưởng",
    icon: (
      <svg className="w-12 h-12 text-[#0B0D0E]" viewBox="0 0 24 24" fill="none">
        <path d="M12 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    value: "4.9/5", label: "Đánh giá trung bình",
    icon: (
      <svg className="w-12 h-12 text-[#0B0D0E]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    value: "Miễn phí", label: "Giao hàng toàn quốc",
    icon: (
      <svg className="w-12 h-12 text-[#0B0D0E]" viewBox="0 0 24 24" fill="none">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.29 2.83A2 2 0 006.27 19h12.46M10 21a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    value: "24 tháng", label: "Bảo hành chính hãng",
    icon: (
      <svg className="w-12 h-12 text-[#0B0D0E]" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
];

const journeyItems = [
  {
    label: "Đi làm",
    img: "https://images.unsplash.com/photo-1560977094-d4874013b1ff?w=600&h=800&fit=crop&auto=format",
    href: "/danh-muc/balo-laptop",
    alt: "Người đi làm với balo laptop",
  },
  {
    label: "Đi học",
    img: "https://images.unsplash.com/photo-1551974222-1d49f576a2a4?w=600&h=800&fit=crop&auto=format",
    href: "/danh-muc/balo-hoc-sinh",
    alt: "Học sinh sinh viên với balo",
  },
  {
    label: "Du lịch",
    img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&h=800&fit=crop&auto=format",
    href: "/danh-muc/balo-du-lich",
    alt: "Du khách với balo du lịch",
  },
  {
    label: "Phượt",
    img: "https://images.unsplash.com/photo-1586022045497-31fcf76fa6cc?w=600&h=800&fit=crop&auto=format",
    href: "/danh-muc/balo-du-lich",
    alt: "Phượt thủ trên núi với balo trekking",
  },
];

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

  const featuredProducts = formattedProducts.slice(0, 8);
  const heroProducts = dbProducts.filter((p) => p.isHeroFeatured).slice(0, 5);

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

  return (
    <main>
      {/* === HERO CAROUSEL (Client Component with Database-driven Promotions) === */}
      <HeroSection initialPromotions={activePromotions} products={heroProducts} />

      {/* === FEATURED PRODUCTS (Client Component) === */}
      <FeaturedProducts products={featuredProducts} />

      {/* === CATEGORIES (Client Component - Oculus Store Design) === */}
      <CategoryStyleSlider initialCategories={sliderCategories} />

      {/* === STATS (Server-rendered) === */}
      <section className="bg-white border-y border-[#E5E7EB] py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E5E7EB]">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-center py-4 px-4 gap-4 reveal-up" style={{ animationDelay: `${i * 0.1}s` }}>
                {stat.icon}
                <div className="flex flex-col text-left">
                  <p className="font-display font-black text-[#0B0D0E] text-2xl lg:text-3xl uppercase leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[#6B6E72] text-sm mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === BUILT FOR EVERY JOURNEY (Server-rendered) === */}
      <section className="py-16 lg:py-20 bg-[#F3F4F6]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="mb-10 reveal-up">
            <h2 className="font-display font-black text-[#0B0D0E] text-3xl lg:text-5xl uppercase tracking-tight">
              Built for every journey
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {journeyItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group relative overflow-hidden aspect-[4/3] lg:aspect-[16/9] block bg-[#1E2022] rounded-sm shadow-sm hover:shadow-lg transition-shadow reveal-up"
                style={{ animationDelay: `${i * 0.1}s` }}
                aria-label={item.label}
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
                  <span className="font-display font-black text-white text-2xl uppercase tracking-wide group-hover:text-[#F5B800] transition-colors">
                    {item.label}
                  </span>
                  <div className="w-9 h-9 bg-[#F5B800] rounded-sm flex items-center justify-center group-hover:bg-white transition-colors">
                    <svg className="w-4 h-4 text-black" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
