"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Share2, Tag, BookOpen, Check } from "lucide-react";
import { BlogPost } from "@/data/blogs";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${slug}`);
      const data = await res.json();
      if (data.post) {
        setPost(data.post);
        setRelated(data.related || []);
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#0B0D0E] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5B800] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E] text-white">
        <div className="max-w-[1440px] mx-auto px-6 text-center space-y-6 pt-12">
          <h1 className="font-display font-bold text-3xl">Bài viết không tồn tại</h1>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[#F5B800] text-black font-bold px-6 py-3 rounded-xl uppercase text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      {/* Background ambient glows */}
      <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-[#F5B800]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-10">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#9CA3AF] hover:text-[#F5B800] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tất cả bài viết blog
        </Link>

        {/* ARTICLE HEADER */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#F5B800]/15 border border-[#F5B800]/40 text-[#F5B800] text-xs font-mono font-bold uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-xs text-[#9CA3AF] font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#F5B800]" /> {post.publishedAt}
            </span>
            <span className="text-xs text-[#9CA3AF] font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F5B800]" /> {post.readingTime}
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {/* Author Capsule */}
          <div className="flex items-center justify-between pt-4 border-t border-b border-[#22242B] py-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-full object-cover border border-[#F5B800]/40"
              />
              <div>
                <p className="font-sans font-bold text-sm text-white">{post.author.name}</p>
                <p className="text-xs text-[#9CA3AF] font-mono">{post.author.role}</p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181A1F] border border-[#2A2D35] hover:border-[#F5B800] text-xs font-mono text-[#9CA3AF] hover:text-white transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã chép link!" : "Chia sẻ bài viết"}</span>
            </button>
          </div>
        </div>

        {/* COVER PHOTO */}
        <div className="rounded-3xl overflow-hidden border border-[#22242B] shadow-2xl aspect-[16/9] relative">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* EXCERPT HIGHLIGHT */}
        <div className="p-6 rounded-2xl bg-[#121417] border-l-4 border-[#F5B800] text-base text-[#D1D5DB] font-sans leading-relaxed italic">
          "{post.excerpt}"
        </div>

        {/* ARTICLE BODY */}
        <article className="prose prose-invert max-w-none font-sans leading-relaxed text-[#D1D5DB] space-y-6 text-base whitespace-pre-line">
          {post.content}
        </article>

        {/* TAGS */}
        <div className="pt-6 border-t border-[#22242B] flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-[#F5B800]" />
          {post.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-lg bg-[#181A1F] border border-[#2A2D35] text-xs font-mono text-[#9CA3AF]"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* RELATED ARTICLES */}
        {related.length > 0 && (
          <div className="pt-12 border-t border-[#22242B] space-y-6">
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F5B800]" />
              Bài viết cùng chuyên mục
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group bg-[#121417] border border-[#22242B] hover:border-[#F5B800]/50 rounded-xl overflow-hidden p-4 space-y-3 transition-all hover:-translate-y-1"
                >
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="w-full h-36 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-[#F5B800] line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
