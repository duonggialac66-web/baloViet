import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tai-khoan", "/gio-hang", "/thanh-toan", "/api/"],
    },
    sitemap: "https://baloviet.vn/sitemap.xml",
  };
}
