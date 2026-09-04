import type { Metadata } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

// Format price utility
const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// SSG: Next.js pre-renders all product pages at build time (optional if DB is dynamic)
// export async function generateStaticParams() {
//   try {
//     const allProducts = await db.select({ slug: products.slug }).from(products);
//     return allProducts.map(p => ({ slug: p.slug }));
//   } catch(e) { return []; }
// }

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  let product;
  try {
    product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
  } catch (error) {
    console.error("DB Error in generateMetadata:", error);
  }
  
  if (!product) return { title: "Không tìm thấy sản phẩm" };

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

export default async function ProductDetailPage({ params }: Props) {
  const slug = (await params).slug;
  let product;
  try {
    product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
  } catch (error) {
    console.error("DB Error in ProductDetailPage:", error);
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D0E] text-white">
        <h1 className="text-3xl font-display font-black">Sản phẩm không tồn tại</h1>
      </div>
    );
  }

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
      <div className="min-h-screen pt-24 pb-16 bg-[#0B0D0E] text-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <h1 className="text-4xl font-display font-black uppercase text-white mb-4">{product.name}</h1>
          <p className="text-xl text-[#F5B800]">{formatPrice(product.salePrice ?? product.price)}</p>
          <p className="mt-6 text-[#6B6E72]">{product.description}</p>
          {/* TO DO: Replace with full UI */}
        </div>
      </div>
    </>
  );
}
