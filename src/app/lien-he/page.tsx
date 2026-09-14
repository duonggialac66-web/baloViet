"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/siteContent";

export default function LienHePage() {
  const [content, setContent] = useState(DEFAULT_CONTACT_CONTENT);
  const [loading, setLoading] = useState(true);

  // Contact form local state
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content?type=contact")
      .then((res) => res.json())
      .then((json) => {
        if (json.config) setContent(json.config);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 800);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#F5B800]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 space-y-16">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
            {content.title}
          </h1>
          <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed font-sans">
            {content.subtitle}
          </p>
        </div>

        {/* 2 COLUMNS: INFO & CONTACT FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INFO CARDS */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#121417]/90 border border-[#22242B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
              <h2 className="font-display font-bold text-xl text-white uppercase tracking-wider border-b border-[#22242B] pb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#F5B800]" />
                Thông tin liên hệ
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B800]/15 border border-[#F5B800]/40 flex items-center justify-center text-[#F5B800] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase font-mono tracking-wider">Hotline hỗ trợ</p>
                    <a href={`tel:${content.hotline}`} className="text-white font-bold text-lg hover:text-[#F5B800] transition-colors">
                      {content.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B800]/15 border border-[#F5B800]/40 flex items-center justify-center text-[#F5B800] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase font-mono tracking-wider">Email chăm sóc</p>
                    <a href={`mailto:${content.email}`} className="text-white font-bold text-base hover:text-[#F5B800] transition-colors">
                      {content.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B800]/15 border border-[#F5B800]/40 flex items-center justify-center text-[#F5B800] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase font-mono tracking-wider">Địa chỉ cửa hàng</p>
                    <p className="text-white text-sm leading-relaxed mt-0.5">{content.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B800]/15 border border-[#F5B800]/40 flex items-center justify-center text-[#F5B800] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase font-mono tracking-wider">Giờ hoạt động</p>
                    <p className="text-white text-sm mt-0.5">{content.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP IFRAME EMBED */}
            {content.mapEmbedUrl && (
              <div className="rounded-2xl border border-[#22242B] overflow-hidden shadow-lg h-64">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Địa chỉ Balo Việt"
                />
              </div>
            )}

          </div>

          {/* RIGHT: INTERACTIVE CONTACT FORM */}
          <div className="lg:col-span-7 bg-[#121417]/90 border border-[#22242B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
                {content.formTitle}
              </h2>
              <p className="text-[#9CA3AF] text-sm mt-1">
                {content.formSubtitle}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-xl text-white">Gửi lời nhắn thành công!</h3>
                <p className="text-emerald-300 text-sm max-w-md mx-auto">
                  Cảm ơn bạn đã liên hệ với Balo Việt. Đội ngũ chăm sóc khách hàng của chúng tôi sẽ phản hồi lại bạn qua email trong thời gian sớm nhất!
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-mono font-bold text-[#F5B800] uppercase tracking-wider underline hover:text-white"
                >
                  Gửi lời nhắn khác →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-[#9CA3AF] mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#181A1F] border border-[#2A2D35] text-black rounded-xl px-4 py-3 text-sm focus:border-[#F5B800] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-[#9CA3AF] mb-1">Địa chỉ Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#181A1F] border border-[#2A2D35] text-black rounded-xl px-4 py-3 text-sm focus:border-[#F5B800] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#9CA3AF] mb-1">Số điện thoại (Không bắt buộc)</label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#181A1F] border border-[#2A2D35] text-black rounded-xl px-4 py-3 text-sm focus:border-[#F5B800] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#9CA3AF] mb-1">Nội dung tin nhắn *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Nhập nội dung cần hỗ trợ hoặc tư vấn sản phẩm..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[#181A1F] border border-[#2A2D35] text-black rounded-xl px-4 py-3 text-sm focus:border-[#F5B800] outline-none transition-colors leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#F5B800] hover:bg-[#E5AB00] text-black font-bold uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(245,184,0,0.25)] transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Đang gửi tin nhắn..." : "Gửi tin nhắn ngay"}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
