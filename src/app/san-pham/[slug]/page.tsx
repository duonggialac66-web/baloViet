import type { Metadata } from "next";
import { db } from "@/lib/db";
import { products as productsSchema } from "@/lib/schema";
import { eq, ne, and, desc } from "drizzle-orm";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import type { Product } from "@/data/products";
import Link from "next/link";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  let product;
  try {
    const list = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.slug, slug))
      .limit(1);
    product = list[0];
  } catch (error) {
    console.error("DB Error in generateMetadata:", error);
  }

  if (!product) return { title: "Không tìm thấy sản phẩm - Balo Việt" };

  const imageUrl = product.imageIds?.[0]
    ? (product.imageIds[0].startsWith("http") ? product.imageIds[0] : buildCloudinaryUrl(product.imageIds[0], { width: 1200, height: 630 }))
    : undefined;

  return {
    title: `${product.name} – Balo Việt Chính Hãng`,
    description: product.shortDescription || `${product.name} giá chỉ ${formatPrice(product.salePrice ?? product.price)}. Bảo hành 24 tháng chính hãng.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : [],
    },
    alternates: {
      canonical: `https://baloviet.vn/san-pham/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const slug = (await params).slug;
  let rawProduct: any = null;
  let rawRelated: any[] = [];

  try {
    const productList = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.slug, slug))
      .limit(1);

    rawProduct = productList[0] || null;

    if (rawProduct) {
      // Fetch related products in the same category
      rawRelated = await db
        .select()
        .from(productsSchema)
        .where(
          and(
            eq(productsSchema.categorySlug, rawProduct.categorySlug),
            ne(productsSchema.id, rawProduct.id)
          )
        )
        .orderBy(desc(productsSchema.createdAt))
        .limit(4);
    }
  } catch (error) {
    console.error("DB Error in ProductDetailPage:", error);
  }

  if (!rawProduct) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-[#0B0D0E] text-white px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-4">
          🎒
        </div>
        <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
          Sản phẩm không tồn tại
        </h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          Sản phẩm bạn đang tìm kiếm có thể đã hết hàng hoặc đường dẫn đã thay đổi.
        </p>
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-2 bg-[#F5B800] text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
        >
          <span>Khám phá tất cả sản phẩm</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  // Helper to format product
  const formatSingleProduct = (p: any): Product => ({
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
    stock: p.stock ?? 0,
    rating: p.rating ?? 4.9,
    reviews: p.reviews ?? 0,
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    specifications: (p.specifications as Record<string, string>) || {},
    tags: p.tags || [],
    images: (p.imageIds && p.imageIds.length > 0)
      ? p.imageIds.map((url: string, index: number) => ({
          url: url.startsWith("http") ? url : buildCloudinaryUrl(url, { width: 900 }),
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
  });

  const formattedProduct = formatSingleProduct(rawProduct);
  const formattedRelated = rawRelated.map(formatSingleProduct);

  // JSON-LD Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: formattedProduct.name,
    image: formattedProduct.images.map((img) => img.url),
    description: formattedProduct.description,
    sku: formattedProduct.sku,
    brand: { "@type": "Brand", name: "Balo Việt" },
    offers: {
      "@type": "Offer",
      price: (formattedProduct.salePrice ?? formattedProduct.price).toString(),
      priceCurrency: "VND",
      availability: formattedProduct.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://baloviet.vn/san-pham/${formattedProduct.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: formattedProduct.rating.toFixed(1),
      reviewCount: formattedProduct.reviews.toString(),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient
        product={formattedProduct}
        relatedProducts={formattedRelated}
      />
    </>
  );
}
