"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Save, RefreshCw, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import BrandGuaranteeSection, { DEFAULT_HOME_POLICY } from "@/components/home/BrandGuaranteeSection";

export default function AdminGuaranteePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    announcementTitle: DEFAULT_HOME_POLICY.announcementTitle,
    announcementSubtitle: DEFAULT_HOME_POLICY.announcementSubtitle,
    card1Title: DEFAULT_HOME_POLICY.card1Title,
    card1Desc: DEFAULT_HOME_POLICY.card1Desc,
    card2Title: DEFAULT_HOME_POLICY.card2Title,
    card2Desc: DEFAULT_HOME_POLICY.card2Desc,
    brandTitle: DEFAULT_HOME_POLICY.brandTitle,
    brandIntro: DEFAULT_HOME_POLICY.brandIntro,
    reasonsTitle: DEFAULT_HOME_POLICY.reasonsTitle,
    reasonsText: DEFAULT_HOME_POLICY.reasons.join("\n"),
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/home-policy");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setForm({
            announcementTitle: data.config.announcementTitle || DEFAULT_HOME_POLICY.announcementTitle,
            announcementSubtitle: data.config.announcementSubtitle || DEFAULT_HOME_POLICY.announcementSubtitle,
            card1Title: data.config.card1Title || DEFAULT_HOME_POLICY.card1Title,
            card1Desc: data.config.card1Desc || DEFAULT_HOME_POLICY.card1Desc,
            card2Title: data.config.card2Title || DEFAULT_HOME_POLICY.card2Title,
            card2Desc: data.config.card2Desc || DEFAULT_HOME_POLICY.card2Desc,
            brandTitle: data.config.brandTitle || DEFAULT_HOME_POLICY.brandTitle,
            brandIntro: data.config.brandIntro || DEFAULT_HOME_POLICY.brandIntro,
            reasonsTitle: data.config.reasonsTitle || DEFAULT_HOME_POLICY.reasonsTitle,
            reasonsText: Array.isArray(data.config.reasons)
              ? data.config.reasons.join("\n")
              : DEFAULT_HOME_POLICY.reasons.join("\n"),
          });
        }
      }
    } catch (err) {
      console.error("Load config error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        announcementTitle: form.announcementTitle,
        announcementSubtitle: form.announcementSubtitle,
        card1Title: form.card1Title,
        card1Desc: form.card1Desc,
        card2Title: form.card2Title,
        card2Desc: form.card2Desc,
        brandTitle: form.brandTitle,
        brandIntro: form.brandIntro,
        reasonsTitle: form.reasonsTitle,
        reasons: form.reasonsText.split("\n").filter((line) => line.trim().length > 0),
      };

      const res = await fetch("/api/admin/home-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Đã lưu cài đặt cam kết & giới thiệu thành công!" });
      } else {
        setMessage({ type: "error", text: "Không thể lưu cài đặt. Vui lòng thử lại!" });
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: "error", text: "Đã xảy ra lỗi kết nối." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (confirm("Khôi phục về nội dung mẫu mặc định?")) {
      setForm({
        announcementTitle: DEFAULT_HOME_POLICY.announcementTitle,
        announcementSubtitle: DEFAULT_HOME_POLICY.announcementSubtitle,
        card1Title: DEFAULT_HOME_POLICY.card1Title,
        card1Desc: DEFAULT_HOME_POLICY.card1Desc,
        card2Title: DEFAULT_HOME_POLICY.card2Title,
        card2Desc: DEFAULT_HOME_POLICY.card2Desc,
        brandTitle: DEFAULT_HOME_POLICY.brandTitle,
        brandIntro: DEFAULT_HOME_POLICY.brandIntro,
        reasonsTitle: DEFAULT_HOME_POLICY.reasonsTitle,
        reasonsText: DEFAULT_HOME_POLICY.reasons.join("\n"),
      });
    }
  };

  const currentPreviewData = {
    announcementTitle: form.announcementTitle,
    announcementSubtitle: form.announcementSubtitle,
    card1Title: form.card1Title,
    card1Desc: form.card1Desc,
    card2Title: form.card2Title,
    card2Desc: form.card2Desc,
    brandTitle: form.brandTitle,
    brandIntro: form.brandIntro,
    reasonsTitle: form.reasonsTitle,
    reasons: form.reasonsText.split("\n").filter((line) => line.trim().length > 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">Cam kết & Giới thiệu thương hiệu</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Tùy chỉnh thanh cam kết bảo hành, 2 thẻ chính sách đổi trả và nội dung giới thiệu ở chân trang chủ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? "Ẩn xem trước" : "Xem trước"}</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            title="Khôi phục mặc định"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Live Preview Box */}
      {showPreview && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Xem trước thực tế trên trang chủ
            </span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-400 hover:text-gray-700 font-semibold"
            >
              Đóng
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <BrandGuaranteeSection initialData={currentPreviewData} />
          </div>
        </div>
      )}

      {/* Main Form */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Đang tải cấu hình...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Group 1: Thanh Banner Đen */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-black" />
              <h2 className="text-base font-bold text-gray-900 uppercase">1. Thanh thông báo đen phía trên</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Tiêu đề chính (Chữ hoa nổi bật)
                </label>
                <input
                  type="text"
                  value={form.announcementTitle}
                  onChange={(e) => setForm({ ...form, announcementTitle: e.target.value })}
                  placeholder="BẢO HÀNH 365 NGÀY - HƯ SỬA - LỖI ĐỔI"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Phụ đề / Khẩu hiệu (Chữ màu vàng)
                </label>
                <input
                  type="text"
                  value={form.announcementSubtitle}
                  onChange={(e) => setForm({ ...form, announcementSubtitle: e.target.value })}
                  placeholder="Bán hàng bằng uy tín. Bạn cứ việc mặc đẹp, hậu mãi cứ để Balo Việt lo."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Hai Thẻ Chính Sách */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <h2 className="text-base font-bold text-gray-900 uppercase">2. Hai thẻ chính sách bảo hành & đổi trả</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thẻ 1 */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Thẻ bên trái</span>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề thẻ 1</label>
                  <input
                    type="text"
                    value={form.card1Title}
                    onChange={(e) => setForm({ ...form, card1Title: e.target.value })}
                    placeholder="14 NGÀY ĐỔI TRẢ"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung chi tiết thẻ 1</label>
                  <textarea
                    rows={4}
                    value={form.card1Desc}
                    onChange={(e) => setForm({ ...form, card1Desc: e.target.value })}
                    placeholder="Hỗ trợ đổi sản phẩm trong vòng 14 ngày..."
                    required
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Thẻ 2 */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Thẻ bên phải</span>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề thẻ 2</label>
                  <input
                    type="text"
                    value={form.card2Title}
                    onChange={(e) => setForm({ ...form, card2Title: e.target.value })}
                    placeholder="BẢO HÀNH 365 NGÀY"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung chi tiết thẻ 2</label>
                  <textarea
                    rows={4}
                    value={form.card2Desc}
                    onChange={(e) => setForm({ ...form, card2Desc: e.target.value })}
                    placeholder="Bảo hành 1 năm cho lỗi kỹ thuật..."
                    required
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Giới Thiệu Thương Hiệu & SEO */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-base font-bold text-gray-900 uppercase">3. Nội dung giới thiệu & lý do chọn thương hiệu</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Tiêu đề thương hiệu (SEO Title)
                </label>
                <input
                  type="text"
                  value={form.brandTitle}
                  onChange={(e) => setForm({ ...form, brandTitle: e.target.value })}
                  placeholder="BALO VIỆT – ĐỒNG HÀNH TRÊN MỌI HÀNH TRÌNH | BALO CAO CẤP CHÍNH HÃNG"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Đoạn văn giới thiệu thương hiệu
                </label>
                <textarea
                  rows={4}
                  value={form.brandIntro}
                  onChange={(e) => setForm({ ...form, brandIntro: e.target.value })}
                  placeholder="Balo Việt là thương hiệu balo & phụ kiện du lịch hàng đầu..."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Tiêu đề danh sách lý do
                </label>
                <input
                  type="text"
                  value={form.reasonsTitle}
                  onChange={(e) => setForm({ ...form, reasonsTitle: e.target.value })}
                  placeholder="Tại sao nên chọn Balo Việt?"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Các gạch đầu dòng lý do (mỗi dòng một ý)
                </label>
                <textarea
                  rows={5}
                  value={form.reasonsText}
                  onChange={(e) => setForm({ ...form, reasonsText: e.target.value })}
                  placeholder="- Bền Bỉ: Vải Cordura...\n- Êm Ái: Quai đeo...\n- Thông Minh: Cổng sạc..."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
