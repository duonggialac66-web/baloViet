import { NextRequest, NextResponse } from "next/server";
import { getStoredBlogPosts } from "@/lib/blogStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const posts = await getStoredBlogPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
    }

    const related = posts
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);

    return NextResponse.json({ post, related });
  } catch (error) {
    console.error("Fetch single blog post error:", error);
    return NextResponse.json({ error: "Lỗi tải bài viết" }, { status: 500 });
  }
}
