"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, User, ArrowRight, Tag, BookOpen, Sparkles } from "lucide-react";
import { BlogPost, INITIAL_BLOG_POSTS } from "@/data/blogs";

const CATEGORIES = [
  "Tất cả",
  "Mẹo Balo & Du lịch",
  "Chăm sóc & Bảo quản",
  "Xu hướng & Phong cách",
  "Tin tức thương hiệu",
];

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page and posts when category or search changes
  useEffect(() => {
    setPage(1);
    setPosts([]); // Clear immediately for better UX
    fetchPosts(1, true);
  }, [selectedCategory, debouncedSearchQuery]);

  // Fetch posts handler
  const fetchPosts = async (currentPage: number, isReset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "Tất cả") params.set("category", selectedCategory);
      if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery.trim());
      params.set("page", currentPage.toString());
      params.set("limit", "6");

      const res = await fetch(`/api/blog?${params.toString()}`);
      const data = await res.json();
      
      if (data.posts) {
        setPosts((prev) => isReset ? data.posts : [...prev, ...data.posts]);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Lỗi tải bài viết blog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  // If we just reset, maybe no featured post should be forced? We use the first one if `posts` isn't empty.
  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];
  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id);

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white overflow-x-hidden relative">
      {/* Background ambient glows */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#F5B800]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 space-y-12">
        
        {/* PAGE HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
            GÓC CHIA SẺ & CẨM NANG
          </h1>
          <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed font-sans">
            Cập nhật xu hướng balo mới nhất, bí quyết bảo quản và cẩm nang chuẩn bị hành lý cho mọi chuyến đi.
          </p>
        </div>

        {/* SEARCH & CATEGORY FILTER CHIPS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121417]/80 p-4 rounded-2xl border border-[#22242B] backdrop-blur-md">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 font-sans ${
                    selectedCategory === cat
                      ? "bg-[#F5B800] text-black font-bold shadow-[0_0_15px_rgba(245,184,0,0.3)]"
                      : "bg-[#181A1F] text-[#9CA3AF] hover:text-white border border-[#2A2D35] hover:border-[#F5B800]/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181A1F] border border-[#2A2D35] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#F5B800] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* FEATURED POST HERO CARD */}
        {featuredPost && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block relative rounded-2xl overflow-hidden border border-[#22242B] hover:border-[#F5B800]/60 transition-all duration-300 shadow-xl bg-[#121417]"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              <div className="md:col-span-4 h-48 md:h-auto relative overflow-hidden shrink-0">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-transparent md:hidden" />
              </div>

              <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F5B800]/15 border border-[#F5B800]/40 text-[#F5B800] text-[10px] font-mono font-bold uppercase tracking-wider">
                      BÀI VIẾT NỔI BẬT
                    </span>
                    <span className="text-xs text-[#9CA3AF] font-mono">{featuredPost.publishedAt}</span>
                  </div>

                  <h2 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#F5B800] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>

                  <p className="text-[#9CA3AF] text-xs sm:text-sm leading-relaxed font-sans line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#22242B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#F5B800]/40"
                    />
                    <div>
                      <p className="text-xs font-bold text-white font-sans leading-none">{featuredPost.author.name}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-mono leading-tight mt-0.5">{featuredPost.readingTime}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F5B800] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* REGULAR ARTICLES GRID */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F5B800]" />
            Tất cả bài viết ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-[#121417]/50 rounded-2xl border border-[#22242B]">
              <p className="text-[#9CA3AF] text-sm">Không tìm thấy bài viết nào phù hợp.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col justify-between bg-[#121417] border border-[#22242B] hover:border-[#F5B800]/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(245,184,0,0.15)] hover:-translate-y-1"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="aspect-[16/10] relative overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0B0D0E]/85 backdrop-blur-md border border-[#F5B800]/40 text-[#F5B800] text-[10px] font-mono font-bold uppercase tracking-wider">
                          {post.category}
                        </div>
                      </div>

                      {/* Content Brief */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#F5B800]" />
                          <span>{post.publishedAt}</span>
                          <span>•</span>
                          <span>{post.readingTime}</span>
                        </div>

                        <h3 className="font-display font-bold text-lg text-white group-hover:text-[#F5B800] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-[#9CA3AF] text-xs leading-relaxed font-sans line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 border-t border-[#1E2026] flex items-center justify-between bg-[#0E1013]/60">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-[#D1D5DB] font-sans font-medium">{post.author.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#F5B800] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {page < totalPages && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-8 py-3 rounded-full bg-transparent border-2 border-[#F5B800] text-[#F5B800] font-bold text-sm uppercase tracking-wider hover:bg-[#F5B800] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      "Tải thêm bài viết"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  );
}
