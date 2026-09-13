"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Edit2, Trash2, Save, X, RefreshCw, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/data/blogs";

const CATEGORIES = [
  "Mẹo Balo & Du lịch",
  "Chăm sóc & Bảo quản",
  "Xu hướng & Phong cách",
  "Tin tức thương hiệu",
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: CATEGORIES[0],
    excerpt: "",
    content: "",
    coverImage: "",
    readingTime: "5 phút đọc",
    tags: "Balo Việt, Kinh nghiệm",
    isFeatured: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      category: CATEGORIES[0],
      excerpt: "",
      content: "",
      coverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000",
      readingTime: "5 phút đọc",
      tags: "Balo Việt, Kinh nghiệm",
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      readingTime: post.readingTime,
      tags: post.tags.join(", "),
      isFeatured: !!post.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        id: editingPost?.id,
      };

      const method = editingPost ? "PUT" : "POST";
      const res = await fetch("/api/admin/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPosts();
      }
    } catch (err) {
      console.error("Lỗi lưu bài viết:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900/80 p-6 rounded-xl border border-gray-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#F5B800]" />
            Quản Lý Bài Viết Blog
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Tạo bài viết mới, chỉnh sửa cẩm nang, mẹo chọn balo và tin tức thương hiệu.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#F5B800] hover:bg-[#E5AB00] text-black font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Bài Viết Mới</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 outline-none focus:border-[#F5B800]"
          />
        </div>

        <span className="text-xs font-mono text-gray-400">
          Tổng cộng: <strong className="text-white">{filteredPosts.length}</strong> bài viết
        </span>
      </div>

      {/* Blog List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-[#F5B800] animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/80 text-xs uppercase font-mono tracking-wider text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="p-4">Bài viết</th>
                  <th className="p-4">Chuyên mục</th>
                  <th className="p-4">Ngày đăng</th>
                  <th className="p-4 text-center">Nổi bật</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{post.title}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-400">{post.publishedAt}</td>
                    <td className="p-4 text-center">
                      {post.isFeatured ? (
                        <Star className="w-4 h-4 text-[#F5B800] fill-[#F5B800] inline-block" />
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex p-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg transition-colors"
                        title="Xem bài viết"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(post)}
                        className="p-2 bg-gray-800 text-amber-400 hover:bg-amber-600 hover:text-black rounded-lg transition-colors"
                        title="Sửa bài viết"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 bg-gray-800 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#F5B800]" />
                {editingPost ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
                  placeholder="VD: Hướng dẫn chọn balo laptop..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Đường dẫn Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white font-mono text-xs rounded-lg px-4 py-2.5 focus:border-[#F5B800] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Chuyên mục *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:border-[#F5B800] outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Ảnh đại diện (Cover Image URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:border-[#F5B800] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Tóm tắt ngắn (Excerpt) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:border-[#F5B800] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Nội dung chi tiết (Content Markdown / Plaintext) *</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:border-[#F5B800] outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Thời gian đọc</label>
                  <input
                    type="text"
                    value={formData.readingTime}
                    onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:border-[#F5B800] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Thẻ Tags (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:border-[#F5B800] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#F5B800]"
                />
                <label htmlFor="isFeatured" className="text-sm font-bold text-white cursor-pointer">
                  Đặt làm bài viết Nổi bật trên cùng (Featured Article)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 text-sm font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#F5B800] text-black font-bold rounded-lg hover:bg-[#E5AB00] text-sm shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? "Đang lưu..." : "Lưu bài viết"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
