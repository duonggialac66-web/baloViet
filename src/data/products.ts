export interface ProductImage {
  url: string;
  alt: string;
  thumbnail: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  category: string;
  categorySlug: string;
  stock: number;
  rating: number;
  reviews: number;
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  tags: string[];
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  isBestSeller?: boolean;
  isNew?: boolean;
  imageIds?: string[] | null;
  imageAlts?: string[] | null;
}

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
