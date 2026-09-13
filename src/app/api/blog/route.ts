import { NextRequest, NextResponse } from "next/server";
import { getStoredBlogPosts } from "@/lib/blogStorage";
import { INITIAL_BLOG_POSTS } from "@/data/blogs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.toLowerCase();

    let posts = await getStoredBlogPosts();

    if (category && category !== "Tất cả" && category !== "all") {
      posts = posts.filter((p) => p.category === category);
    }

    if (q) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Fetch blog posts error:", error);
    return NextResponse.json({ posts: INITIAL_BLOG_POSTS });
  }
}
