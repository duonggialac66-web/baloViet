import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStoredBlogPosts, saveStoredBlogPosts } from "@/lib/blogStorage";
import { BlogPost } from "@/data/blogs";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const posts = await getStoredBlogPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải bài viết" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const posts = await getStoredBlogPosts();

    const newPost: BlogPost = {
      id: `blog-${nanoid(6)}`,
      title: body.title || "Bài viết mới",
      slug: body.slug || `bai-viet-${Date.now()}`,
      category: body.category || "Mẹo Balo & Du lịch",
      excerpt: body.excerpt || "",
      content: body.content || "",
      coverImage: body.coverImage || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000",
      author: body.author || {
        name: user.fullName || "Admin Balo Việt",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        role: "Ban Biên Tập Balo Việt"
      },
      publishedAt: new Date().toISOString().split("T")[0],
      readingTime: body.readingTime || "5 phút đọc",
      tags: Array.isArray(body.tags) ? body.tags : ["Balo Việt"],
      isFeatured: !!body.isFeatured,
      views: 0
    };

    const updated = [newPost, ...posts];
    await saveStoredBlogPosts(updated);

    return NextResponse.json({ success: true, post: newPost, message: "Tạo bài viết thành công!" });
  } catch (error) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ error: "Lỗi tạo bài viết" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    let posts = await getStoredBlogPosts();

    const idx = posts.findIndex((p) => p.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
    }

    posts[idx] = { ...posts[idx], ...body };
    await saveStoredBlogPosts(posts);

    return NextResponse.json({ success: true, message: "Cập nhật bài viết thành công!" });
  } catch (error) {
    console.error("Update blog post error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật bài viết" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID bài viết" }, { status: 400 });
    }

    let posts = await getStoredBlogPosts();
    posts = posts.filter((p) => p.id !== id);
    await saveStoredBlogPosts(posts);

    return NextResponse.json({ success: true, message: "Đã xóa bài viết!" });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return NextResponse.json({ error: "Lỗi xóa bài viết" }, { status: 500 });
  }
}
