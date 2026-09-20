import { products as productsSchema } from "@/lib/schema";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import type { Product } from "@/data/products";

/**
 * Các cột cần cho hiển thị danh sách sản phẩm (Card).
 * Bỏ qua các cột nặng: description, shortDescription, specifications, sku, tags
 * để giảm dung lượng truyền từ Database.
 */
export const productListColumns = {
  id: productsSchema.id,
  name: productsSchema.name,
  slug: productsSchema.slug,
  price: productsSchema.price,
  salePrice: productsSchema.salePrice,
  categorySlug: productsSchema.categorySlug,
  stock: productsSchema.stock,
  rating: productsSchema.rating,
  reviews: productsSchema.reviews,
  colors: productsSchema.colors,
  isBestSeller: productsSchema.isBestSeller,
  isNew: productsSchema.isNew,
  imageIds: productsSchema.imageIds,
  imageAlts: productsSchema.imageAlts,
};

/**
 * Map categorySlug → tên hiển thị tiếng Việt.
 */
const CATEGORY_NAMES: Record<string, string> = {
  "balo-laptop": "Balo Laptop",
  "balo-du-lich": "Balo Du Lịch",
  "balo-hoc-sinh": "Balo Học Sinh",
  "balo-thoi-trang": "Balo Thời Trang",
  "balo-chong-nuoc": "Balo Chống Nước",
};

function getCategoryName(slug: string | null | undefined): string {
  return (slug && CATEGORY_NAMES[slug]) || "Balo Cao Cấp";
}

/**
 * Chuẩn hóa danh sách ảnh từ raw DB row.
 * Dùng URL gốc, không qua Cloudinary transform (phù hợp cho Card / danh sách).
 */
function formatImages(imageIds: string[] | null | undefined, imageAlts: string[] | null | undefined, productName: string) {
  if (imageIds && imageIds.length > 0) {
    return imageIds.map((url: string, index: number) => ({
      url,
      alt: imageAlts?.[index] || productName,
      thumbnail: url,
    }));
  }
  return [{
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    alt: productName,
    thumbnail: "",
  }];
}

/**
 * Format 1 DB row → Product object cho hiển thị dạng Card (danh sách).
 * Chỉ yêu cầu các trường trong `productListColumns`.
 */
export function formatProductForCard(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || "",
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    category: getCategoryName(p.categorySlug),
    categorySlug: p.categorySlug,
    stock: p.stock ?? 0,
    rating: p.rating ?? 4.8,
    reviews: p.reviews ?? 0,
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    specifications: (p.specifications as Record<string, string>) || {},
    tags: p.tags || [],
    images: formatImages(p.imageIds, p.imageAlts, p.name),
    colors: (p.colors as { name: string; hex: string }[]) || [{ name: "Đen", hex: "#000000" }],
    isBestSeller: p.isBestSeller ?? false,
    isNew: p.isNew ?? false,
  };
}

/**
 * Format 1 DB row → Product object đầy đủ cho trang chi tiết.
 * Bao gồm tất cả các trường + Cloudinary URL transform cho ảnh lớn.
 */
export function formatProductForDetail(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    category: getCategoryName(p.categorySlug),
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
  };
}
