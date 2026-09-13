"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    heroTitle: "VỀ CHÚNG TÔI",
    heroSubtitle: "CÂU CHUYỆN THƯƠNG HIỆU BALO VIỆT",
    introText: "",
    storyTitle: "",
    storyContent: "",
    stats: [
      { label: "Năm kinh nghiệm", value: "10+" },
      { label: "Khách hàng tin dùng", value: "50.000+" },
      { label: "Sản phẩm chính hãng", value: "100%" },
      { label: "Hỗ trợ bảo hành", value: "24/7" },
    ],
    missionTitle: "",
    missionDesc: "",
    values: [
      { title: "", desc: "" },
      { title: "", desc: "" },
      { title: "", desc: "" },
    ],
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-content?type=about");
      const json = await res.json();
      if (json.config) {
        setFormData(json.config);
      }
    } catch (err) {
      console.error("Lỗi tải nội dung Về chúng tôi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "about", data: formData }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ type: "success", text: json.message || "Cập nhật thành công!" });
      } else {
        setMessage({ type: "error", text: json.error || "Có lỗi xảy ra" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatChange = (index: number, field: "label" | "value", val: string) => {
    const newStats = [...formData.stats];
    newStats[index][field] = val;
    setFormData({ ...formData, stats: newStats });
  };

  const handleValueChange = (index: number, field: "title" | "desc", val: string) => {
    const newVals = [...formData.values];
    newVals[index][field] = val;
    setFormData({ ...formData, values: newVals });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#F5B800] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900/80 p-6 rounded-xl border border-gray-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F5B800]" />
            Quản Lý Trang Về Chúng Tôi
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Chỉnh sửa toàn bộ thông tin giới thiệu, câu chuyện thương hiệu, chỉ số ấn tượng và giá trị cốt lõi.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-[#F5B800] hover:bg-[#E5AB00] text-black font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
              : "bg-rose-950/50 border-rose-800 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phần Hero */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3">
            1. Phần Hero Giới Thiệu Đầu Trang
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Tiêu đề chính (Hero Title)
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Tiêu đề phụ / Slogan
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Đoạn giới thiệu tổng quan (Intro Text)
            </label>
            <textarea
              rows={3}
              value={formData.introText}
              onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
            />
          </div>
        </div>

        {/* Thống kê ấn tượng */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3">
            2. Thống Kê Nổi Bật (Stats Cards)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.stats.map((st, idx) => (
              <div key={idx} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 space-y-2">
                <p className="text-xs font-bold text-[#F5B800]">Mục #{idx + 1}</p>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Con số / Giá trị</label>
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white font-bold rounded px-3 py-1.5 text-sm outline-none focus:border-[#F5B800]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Tên chỉ số</label>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Câu chuyện thương hiệu */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3">
            3. Câu Chuyện Thương Hiệu
          </h2>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Tiêu đề bài viết
            </label>
            <input
              type="text"
              value={formData.storyTitle}
              onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Nội dung câu chuyện thương hiệu
            </label>
            <textarea
              rows={5}
              value={formData.storyContent}
              onChange={(e) => setFormData({ ...formData, storyContent: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Giá trị cốt lõi */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3">
            4. Giá Trị Cốt Lõi & Cam Kết
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.values.map((v, idx) => (
              <div key={idx} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 space-y-2">
                <p className="text-xs font-bold text-[#F5B800]">Giá trị #{idx + 1}</p>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={v.title}
                    onChange={(e) => handleValueChange(idx, "title", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white font-semibold rounded px-3 py-1.5 text-sm outline-none focus:border-[#F5B800]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Mô tả ngắn</label>
                  <textarea
                    rows={3}
                    value={v.desc}
                    onChange={(e) => handleValueChange(idx, "desc", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#F5B800] hover:bg-[#E5AB00] text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi trang Về chúng tôi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
