"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Award, Users, Clock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/siteContent";

export default function VeChungToiPage() {
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/site-content?type=about")
      .then((res) => res.json())
      .then((json) => {
        if (json.config) setContent(json.config);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      {/* Ambient background glows */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#F5B800]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 space-y-16">
        
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
            {content.heroTitle}
          </h1>
          <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed font-sans pt-2">
            {content.introText}
          </p>
        </div>

        {/* STATS HIGHLIGHT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {content.stats.map((st, idx) => (
            <div
              key={idx}
              className="relative group p-6 rounded-2xl bg-[#121417]/80 backdrop-blur-md border border-[#22242B] hover:border-[#F5B800]/60 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(245,184,0,0.15)]"
            >
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#F5B800] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#F5B800] opacity-0 group-hover:opacity-100 transition-opacity" />

              <h3 className="font-mono font-black text-3xl sm:text-4xl text-[#F5B800] tracking-tight">
                {st.value}
              </h3>
              <p className="text-[#9CA3AF] text-xs sm:text-sm font-sans font-medium uppercase tracking-wider mt-2">
                {st.label}
              </p>
            </div>
          ))}
        </div>

        {/* BRAND STORY */}
        <div className="bg-[#121417]/90 border border-[#22242B] rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-wide flex items-center gap-3">
              <span className="w-8 h-1 bg-[#F5B800] rounded-full inline-block" />
              {content.storyTitle}
            </h2>
            <p className="text-[#D1D5DB] text-base sm:text-lg leading-relaxed whitespace-pre-line font-sans">
              {content.storyContent}
            </p>
          </div>
        </div>

        {/* CORE VALUES & MISSION */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-wide">
              {content.missionTitle || "GIÁ TRỊ CỐT LÕI"}
            </h2>
            <p className="text-[#9CA3AF] text-sm sm:text-base mt-2">
              {content.missionDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.values.map((v, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#121417]/80 backdrop-blur-md border border-[#22242B] hover:border-[#F5B800]/50 transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F5B800]/15 border border-[#F5B800]/40 flex items-center justify-center text-[#F5B800] font-mono font-bold text-lg">
                  0{idx + 1}
                </div>
                <h3 className="font-sans font-bold text-xl text-white">{v.title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed font-sans">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="text-center pt-8 border-t border-[#1E2024]">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-3 bg-[#F5B800] hover:bg-[#E5AB00] text-black font-display font-black uppercase tracking-widest text-sm px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(245,184,0,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Khám phá sản phẩm ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}
