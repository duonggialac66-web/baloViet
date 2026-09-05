import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { categories as categoriesSchema, products as productsSchema } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import Breadcrumb from "@/components/Breadcrumb";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let category: any = null;
  try {
    const res = await db
      .select()
      .from(categoriesSchema)
      .where(eq(categoriesSchema.slug, slug))
      .limit(1);
    category = res[0] || null;
  } catch (err) {
    console.warn("Error fetching category:", err);
  }

  const title = category?.name ? `${category.name} – Balo Việt` : "Danh mục sản phẩm – Balo Việt";
  const description = category?.description || "Khám phá bộ sưu tập balo cao cấp chính hãng từ Balo Việt.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function DanhMucPage({ params }: Props) {
  const { slug } = await params;
  
  let category: any = null;
  let dbProducts: any[] = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      db.select().from(categoriesSchema).where(eq(categoriesSchema.slug, slug)).limit(1),
      db.select().from(productsSchema).where(eq(productsSchema.categorySlug, slug)).orderBy(desc(productsSchema.createdAt)),
    ]);
    category = catRes[0] || null;
    dbProducts = prodRes;

    // If no products in category, fetch recent products as fallback
    if (dbProducts.length === 0) {
      dbProducts = await db.select().from(productsSchema).orderBy(desc(productsSchema.createdAt)).limit(8);
    }
  } catch (err) {
    console.warn("Error fetching category data:", err);
  }

  const formattedProducts: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    category: category?.name || (p.categorySlug === "balo-laptop" ? "Balo Laptop" :
              p.categorySlug === "balo-du-lich" ? "Balo Du Lịch" :
              p.categorySlug === "balo-hoc-sinh" ? "Balo Học Sinh" :
              p.categorySlug === "balo-thoi-trang" ? "Balo Thời Trang" :
              p.categorySlug === "balo-chong-nuoc" ? "Balo Chống Nước" : "Balo Cao Cấp"),
    categorySlug: p.categorySlug,
    stock: p.stock ?? 0,
    rating: p.rating ?? 4.9,
    reviews: p.reviews ?? 0,
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    specifications: (p.specifications as Record<string, string>) || {},
    tags: p.tags || [],
    images: (p.imageIds && p.imageIds.length > 0)
      ? p.imageIds.map((url: string, index: number) => ({
          url,
          alt: p.imageAlts?.[index] || p.name,
          thumbnail: url,
        }))
      : [{
          url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
          alt: p.name,
          thumbnail: "",
        }],
    colors: (p.colors as { name: string; hex: string }[]) || [{ name: "Đen", hex: "#000000" }],
    isBestSeller: p.isBestSeller ?? false,
    isNew: p.isNew ?? false,
  }));

  const categoryTitle = category?.name || slug.replace(/-/g, " ").toUpperCase();

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Danh mục", href: "/san-pham" },
    { label: categoryTitle },
  ];

  return (
    <main className="min-h-screen pt-20 pb-20 bg-[#0B0D0E] text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
          <div>
            <span className="text-xs font-bold text-[#F5B800] uppercase tracking-widest block mb-1">
              BỘ SƯU TẬP
            </span>
            <h1 className="font-display font-black text-white text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight">
              {categoryTitle}
            </h1>
            {category?.description && (
              <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              {formattedProducts.length} sản phẩm
            </span>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1.5 bg-[#F5B800] text-black font-display font-bold uppercase tracking-wider text-xs px-4 py-2 hover:bg-white transition-colors rounded-xl"
            >
              <span>Tất cả sản phẩm</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Product Grid - 2 cols on mobile, 4 cols on desktop */}
        {formattedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {formattedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400 bg-white/5 rounded-3xl border border-white/10 p-8">
            <div className="text-4xl mb-3">🎒</div>
            <p className="text-lg font-bold text-white mb-1">Chưa có sản phẩm nào trong danh mục này</p>
            <p className="text-sm mb-6 text-gray-400">Vui lòng quay lại xem tất cả các mẫu balo khác.</p>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 bg-[#F5B800] text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
