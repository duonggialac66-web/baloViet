import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products, categories, blogPosts } from "@/lib/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = "https://baloviet.vn";

  let allProducts: any[] = [];
  let allCategories: any[] = [];
  let allPosts: any[] = [];
  
  try {
    allProducts = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products);
    allCategories = await db.select({ slug: categories.slug }).from(categories);
    allPosts = await db.select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt }).from(blogPosts);
  } catch (error) {
    console.error("Error fetching sitemap data from DB:", error);
  }

  return [
    { url: BASE, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/san-pham`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/ve-chung-toi`, priority: 0.6 },
    { url: `${BASE}/lien-he`, priority: 0.5 },

    ...allProducts.map(p => ({
      url: `${BASE}/san-pham/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),

    ...allCategories.map(c => ({
      url: `${BASE}/danh-muc/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    ...allPosts.map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
