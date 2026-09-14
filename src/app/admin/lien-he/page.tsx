"use client";

import { useState, useEffect } from "react";
import { Phone, Save, CheckCircle2, AlertCircle, RefreshCw, MapPin, Mail, Clock, Globe } from "lucide-react";

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "LIÊN HỆ VỚI BALO VIỆT",
    subtitle: "Chúng tôi luôn sẵn sàng lắng nghe & hỗ trợ bạn 24/7",
    hotline: "1900 1234",
    email: "hello@baloviet.vn",
    address: "123 Đường Balo, Quận 1, TP. Hồ Chí Minh, Việt Nam",
    workingHours: "08:00 - 21:00 (Thứ 2 - Chủ Nhật)",
    mapEmbedUrl: "",
    facebookUrl: "https://facebook.com/baloviet",
    instagramUrl: "https://instagram.com/baloviet",
    tiktokUrl: "https://tiktok.com/@baloviet",
    youtubeUrl: "https://youtube.com/@baloviet",
    formTitle: "GỬI TIN NHẮN CHO CHÚNG TÔI",
    formSubtitle: "Nếu bạn có bất kỳ thắc mắc hoặc góp ý nào, vui lòng để lại thông tin bên dưới.",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-content?type=contact");
      const json = await res.json();
      if (json.config) {
        setFormData(json.config);
      }
    } catch (err) {
      console.error("Lỗi tải nội dung Liên hệ:", err);
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
        body: JSON.stringify({ type: "contact", data: formData }),
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
            <Phone className="w-6 h-6 text-[#F5B800]" />
            Quản Lý Trang Liên Hệ
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Chỉnh sửa hotline, email, địa chỉ cửa hàng, bản đồ Google Maps và các kênh truyền thông xã hội.
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
        {/* Thông tin liên hệ cơ bản */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5" /> 1. Thông Tin Liên Hệ Cơ Bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Tiêu đề chính (Title)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Mô tả phụ (Subtitle)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#F5B800]" /> Hotline điện thoại
              </label>
              <input
                type="text"
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black font-bold rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#F5B800]" /> Email liên hệ
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F5B800]" /> Địa chỉ cửa hàng
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F5B800]" /> Giờ làm việc
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2.5 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bản đồ Google Maps nhúng */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> 2. Nhúng Bản Đồ Google Maps
          </h2>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Link nhúng Iframe Google Maps (Src URL)
            </label>
            <input
              type="text"
              placeholder="https://www.google.com/maps/embed?pb=..."
              value={formData.mapEmbedUrl}
              onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2.5 text-xs font-mono focus:border-[#F5B800] outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Hướng dẫn: Trên Google Maps, bấm "Chia sẻ" ➔ "Nhúng bản đồ" ➔ Copy đường dẫn trong `src="..."`.
            </p>
          </div>

          {formData.mapEmbedUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-700 mt-2">
              <iframe
                src={formData.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Bản đồ xem trước"
              />
            </div>
          )}
        </div>

        {/* Mạng xã hội & Form liên hệ */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#F5B800] border-b border-gray-800 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" /> 3. Mạng Xã Hội & Tiêu Đề Form Liên Hệ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Facebook URL</label>
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Instagram URL</label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">TikTok URL</label>
              <input
                type="text"
                value={formData.tiktokUrl}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">YouTube URL</label>
              <input
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Tiêu đề Form Liên Hệ</label>
              <input
                type="text"
                value={formData.formTitle}
                onChange={(e) => setFormData({ ...formData, formTitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Mô tả Form Liên Hệ</label>
              <input
                type="text"
                value={formData.formSubtitle}
                onChange={(e) => setFormData({ ...formData, formSubtitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-black rounded-lg px-4 py-2 text-sm focus:border-[#F5B800] outline-none"
              />
            </div>
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
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi trang Liên hệ"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
