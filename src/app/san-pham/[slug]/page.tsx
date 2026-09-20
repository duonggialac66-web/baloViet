import type { Metadata } from "next";
import { db } from "@/lib/db";
import { products as productsSchema } from "@/lib/schema";
import { eq, ne, and, desc } from "drizzle-orm";
import { productListColumns, formatProductForCard, formatProductForDetail } from "@/lib/queries";
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
      .select({
        name: productsSchema.name,
        slug: productsSchema.slug,
        shortDescription: productsSchema.shortDescription,
        description: productsSchema.description,
        price: productsSchema.price,
        salePrice: productsSchema.salePrice,
        imageIds: productsSchema.imageIds,
      })
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
    // Main product: full SELECT (needs all columns for detail page)
    const productList = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.slug, slug))
      .limit(1);

    rawProduct = productList[0] || null;

    if (rawProduct) {
      // Related products: only list columns (rendered as Cards)
      rawRelated = await db
        .select(productListColumns)
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

  // Use shared helpers for formatting
  const formattedProduct = formatProductForDetail(rawProduct);
  const formattedRelated = rawRelated.map(formatProductForCard);

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
