"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Save, X, Sparkles, Image as ImageIcon, Check, Sliders, MapPin, Move, RotateCcw, Eye, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target } from "lucide-react";
import ImageInputWithRemover from "@/components/admin/ImageInputWithRemover";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { useToast } from "@/store/cartContext";
import type { CategoryDisplaySettings } from "@/lib/schema";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageId: string | null;
  imageAlt: string | null;
  displaySettings?: CategoryDisplaySettings | null;
  count: number;
}

const DEFAULT_ANNOTATIONS = [
  { label: "Chống nước IPX6", dotX: 72, dotY: 28, labelX: 88, labelY: 20, side: "right" as const },
  { label: "Đệm lưng thoáng khí", dotX: 74, dotY: 48, labelX: 90, labelY: 48, side: "right" as const },
  { label: "Chất liệu cao cấp", dotX: 70, dotY: 65, labelX: 88, labelY: 72, side: "right" as const },
  { label: "Ngăn laptop 15.6\"", dotX: 28, dotY: 32, labelX: 5, labelY: 24, side: "left" as const },
  { label: "Bảo hành 24 tháng", dotX: 26, dotY: 55, labelX: 3, labelY: 55, side: "left" as const },
];

const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&auto=format&q=80";

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "display">("general");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageId: "",
    displaySettings: {
      imageX: 0,
      imageY: -5,
      imageScale: 100,
      annotations: DEFAULT_ANNOTATIONS,
    } as CategoryDisplaySettings,
  });

  // Dragging state for preview canvas
  const previewRef = useRef<HTMLDivElement>(null);
  const [draggingTarget, setDraggingTarget] = useState<"image" | number | null>(null);
  const [selectedAnnIndex, setSelectedAnnIndex] = useState<number | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      addToast("Không thể tải danh sách danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setActiveTab("general");
    setSelectedAnnIndex(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      imageId: "",
      displaySettings: {
        imageX: 0,
        imageY: -5,
        imageScale: 100,
        annotations: DEFAULT_ANNOTATIONS,
      },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setActiveTab("general");
    setSelectedAnnIndex(null);
    const s = cat.displaySettings;
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      imageId: cat.imageId || "",
      displaySettings: {
        imageX: s?.imageX ?? 0,
        imageY: s?.imageY ?? -5,
        imageScale: s?.imageScale ?? 100,
        annotations: s?.annotations?.length ? s.annotations : DEFAULT_ANNOTATIONS,
      },
    });
    setIsModalOpen(true);
  };

  const handleSlugify = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (val: string) => {
    if (!editingCategory) {
      setForm({ ...form, name: val, slug: handleSlugify(val) });
    } else {
      setForm({ ...form, name: val });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      addToast("Vui lòng nhập tên và slug danh mục", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Update
        const res = await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategory.id,
            name: form.name,
            slug: form.slug,
            description: form.description,
            imageId: form.imageId,
            displaySettings: form.displaySettings,
          }),
        });

        if (!res.ok) throw new Error("Update failed");
        addToast(`Đã cập nhật danh mục "${form.name}" thành công!`);
      } else {
        // Create new
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description,
            imageId: form.imageId,
            displaySettings: form.displaySettings,
          }),
        });

        if (!res.ok) throw new Error("Create failed");
        addToast(`Đã tạo danh mục mới "${form.name}" thành công!`);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      addToast("Có lỗi xảy ra khi lưu danh mục", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      addToast(`Đã xóa danh mục "${cat.name}"`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      addToast("Không thể xóa danh mục", "error");
    }
  };

  const getImageSrc = (imageId: string | null) => {
    if (!imageId) return DEFAULT_BANNER_IMAGE;
    if (imageId.startsWith("http") || imageId.startsWith("data:")) return imageId;
    return buildCloudinaryUrl(imageId, { width: 600, height: 600 });
  };

  // Nudge position X/Y helper
  const nudgeImage = (dx: number, dy: number) => {
    setForm({
      ...form,
      displaySettings: {
        ...form.displaySettings,
        imageX: Math.max(-45, Math.min(45, (form.displaySettings.imageX ?? 0) + dx)),
        imageY: Math.max(-45, Math.min(45, (form.displaySettings.imageY ?? -5) + dy)),
      },
    });
  };

  // Nudge scale helper
  const nudgeScale = (delta: number) => {
    setForm({
      ...form,
      displaySettings: {
        ...form.displaySettings,
        imageScale: Math.max(50, Math.min(180, (form.displaySettings.imageScale ?? 100) + delta)),
      },
    });
  };

  // Snap image center to ring
  const snapToCenter = () => {
    setForm({
      ...form,
      displaySettings: {
        ...form.displaySettings,
        imageX: 0,
        imageY: -5,
      },
    });
    addToast("Đã căn chính giữa đĩa 3D", "info");
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (activeTab !== "display") return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 5 : -5;
    nudgeScale(delta);
  };

  // Helper annotation updates
  const addAnnotation = () => {
    const anns = form.displaySettings.annotations || [];
    setForm({
      ...form,
      displaySettings: {
        ...form.displaySettings,
        annotations: [
          ...anns,
          { label: "Thông số mới", dotX: 50, dotY: 50, labelX: 85, labelY: 45, side: "right" },
        ],
      },
    });
    setSelectedAnnIndex(anns.length);
  };

  const updateAnnotation = (index: number, field: string, value: any) => {
    const anns = [...(form.displaySettings.annotations || [])];
    anns[index] = { ...anns[index], [field]: value };
    setForm({
      ...form,
      displaySettings: { ...form.displaySettings, annotations: anns },
    });
  };

  const removeAnnotation = (index: number) => {
    const anns = (form.displaySettings.annotations || []).filter((_, i) => i !== index);
    setForm({
      ...form,
      displaySettings: { ...form.displaySettings, annotations: anns },
    });
    if (selectedAnnIndex === index) setSelectedAnnIndex(null);
  };

  const resetDisplayDefaults = () => {
    setForm({
      ...form,
      displaySettings: {
        imageX: 0,
        imageY: -5,
        imageScale: 100,
        annotations: DEFAULT_ANNOTATIONS,
      },
    });
    addToast("Đã khôi phục cài đặt hiển thị mặc định", "info");
  };

  // Drag & Drop Mouse Handlers
  const handlePointerDown = (e: React.PointerEvent, target: "image" | number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingTarget(target);
    if (typeof target === "number") {
      setSelectedAnnIndex(target);
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingTarget === null || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const pctX = Math.max(0, Math.min(100, (clientX / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (clientY / rect.height) * 100));

    if (draggingTarget === "image") {
      const imageX = Math.round(pctX - 50);
      const imageY = Math.round(pctY - 45);
      setForm({
        ...form,
        displaySettings: {
          ...form.displaySettings,
          imageX: Math.max(-45, Math.min(45, imageX)),
          imageY: Math.max(-45, Math.min(45, imageY)),
        },
      });
    } else if (typeof draggingTarget === "number") {
      const index = draggingTarget;
      const anns = [...(form.displaySettings.annotations || [])];
      const dotX = Math.round(pctX);
      const dotY = Math.round(pctY);

      const side = dotX > 50 ? "right" : "left";
      const labelX = side === "right" ? Math.min(95, dotX + 16) : Math.max(5, dotX - 16);
      const labelY = dotY;

      anns[index] = {
        ...anns[index],
        dotX,
        dotY,
        labelX,
        labelY,
        side,
      };

      setForm({
        ...form,
        displaySettings: { ...form.displaySettings, annotations: anns },
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTarget !== null) {
      setDraggingTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Đang tải danh sách danh mục...</p>
      </div>
    );
  }

  const previewImageSrc = getImageSrc(form.imageId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121417] p-6 rounded-2xl border border-[#22242B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">Quản lý Danh mục</h1>
          <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 font-sans">
            Thiết lập danh mục, xóa phông AI và tinh chỉnh vị trí/kích thước balo vừa vặn đĩa 3D cho từng ảnh.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-black font-bold rounded-xl transition-colors font-sans text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,184,0,0.25)] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-[#121417] rounded-2xl border border-[#22242B] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-[#181A1F] border-b border-[#22242B] text-[#9CA3AF] font-mono font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-24">Ảnh</th>
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Cấu hình Banner</th>
                <th className="px-6 py-4 text-center w-24">Số SP</th>
                <th className="px-6 py-4 text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2228] text-gray-200">
              {categories.map((cat) => {
                const imgSrc = getImageSrc(cat.imageId);
                const s = cat.displaySettings;
                return (
                  <tr key={cat.id} className="hover:bg-[#181A1F]/70 transition-colors">
                    {/* Image Thumbnail */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() => openEditModal(cat)}
                        className="w-12 h-12 rounded-xl border border-[#2A2C2F] bg-[#181A1F] flex items-center justify-center overflow-hidden cursor-pointer group shadow-xs hover:shadow-md transition-all relative"
                        title="Bấm để chỉnh sửa & xem trước"
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={cat.name}
                            className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#F5B800] text-[10px] font-bold transition-opacity">
                          Sửa
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 font-bold text-white text-xs">
                      {cat.name}
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4 text-[#9CA3AF] font-mono text-xs">
                      {cat.slug}
                    </td>

                    {/* Display settings badge */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                          X:{s?.imageX ?? 0}% Y:{s?.imageY ?? -5}%
                        </span>
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                          Scale:{s?.imageScale ?? 100}%
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                          {s?.annotations?.length ?? 5} thông số
                        </span>
                      </div>
                    </td>

                    {/* Product count */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#181A1F] text-[#F5B800] border border-[#2A2C2F]">
                        {cat.count}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap font-sans">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="inline-flex items-center gap-1 text-xs text-[#F5B800] hover:underline font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                        title="Chỉnh sửa danh mục & vị trí kéo thả banner"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="inline-flex items-center gap-1 text-xs text-rose-400 hover:underline font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: Thêm / Sửa & Trình biên tập Kéo-Thả Banner Xem Trước */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeup">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl overflow-hidden max-h-[94vh] flex flex-col">
            
            {/* Modal Header & Tabs */}
            <div className="border-b border-gray-200 bg-gray-50/70 shrink-0">
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingCategory ? `Chỉnh sửa: ${editingCategory.name}` : "Thêm danh mục mới"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-3 px-6 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === "general"
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  1. Thông tin & Ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("display")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    activeTab === "display"
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>2. Kéo - Thả Căn Chỉnh Banner</span>
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] uppercase font-bold">Xem trước</span>
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-5">
              
              {/* TAB 1: General Info & AI Remover */}
              {activeTab === "general" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="VD: Balo Laptop"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug đường dẫn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="VD: balo-laptop"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả ngắn
                    </label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Mô tả công năng, phong cách đặc trưng của danh mục..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  {/* Category Image Input */}
                  <div className="pt-2 border-t border-gray-100">
                    <ImageInputWithRemover
                      label="Ảnh đại diện danh mục (PNG trong suốt)"
                      name="categoryImage"
                      value={form.imageId}
                      onChange={(val) => setForm({ ...form, imageId: val })}
                      placeholder="Nhập URL ảnh, tải file lên hoặc bấm Xóa phông AI..."
                      helpText="Mỗi ảnh balo có kích thước & khoảng trống lề khác nhau. Bấm tab '2. Kéo - Thả Căn Chỉnh Banner' để đặt vừa khít đĩa 3D!"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Drag & Drop Visual Banner Editor */}
              {activeTab === "display" && (
                <div className="space-y-4">
                  {/* Instructions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Giải pháp:</strong> Vì mỗi ảnh balo có kích thước lề khác nhau, bạn có thể <strong>kéo Balo</strong> để khớp đĩa 3D bên dưới, hoặc dùng nút mũi tên bên dưới để tinh chỉnh từng pixel!
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={snapToCenter}
                        className="px-2.5 py-1 bg-white border border-amber-300 rounded-md font-semibold text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Căn giữa đĩa sáng"
                      >
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        Căn giữa đĩa
                      </button>
                      <button
                        type="button"
                        onClick={resetDisplayDefaults}
                        className="px-2.5 py-1 bg-white border border-amber-300 rounded-md font-semibold text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Khôi phục thông số mặc định"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Mặc định
                      </button>
                    </div>
                  </div>

                  {/* INTERACTIVE DRAG & DROP CANVAS PREVIEW (1:1 GEOMETRY WITH HERO BANNER) */}
                  <div
                    ref={previewRef}
                    onWheel={handleWheel}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="relative w-full h-[480px] bg-[#090A0B] rounded-2xl overflow-hidden border border-[#18191C] select-none shadow-xl cursor-crosshair"
                  >
                    {/* Background glow effects */}
                    <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-[#F5B800]/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    {/* Visual Guidelines (Crosshair) */}
                    {showGuidelines && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Center vertical dashed line */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-[#F5B800]/25" />
                        {/* Pedestal surface line */}
                        <div className="absolute left-0 right-0 bottom-[95px] h-px border-b border-dashed border-[#F5B800]/25" />
                      </div>
                    )}

                    {/* Live Preview Label Header */}
                    <div className="absolute top-3 left-4 z-40 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-[#F5B800]/30 text-[11px] text-[#F5B800] font-bold tracking-wide flex items-center gap-1.5 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-[#F5B800] animate-ping" />
                      XEM TRƯỚC HERO BANNER (LIVE CANVAS 1:1)
                    </div>

                    {/* Toggle Guidelines button */}
                    <button
                      type="button"
                      onClick={() => setShowGuidelines(!showGuidelines)}
                      className={`absolute top-3 right-4 z-40 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        showGuidelines ? "bg-[#F5B800] text-black border-[#F5B800]" : "bg-black/60 text-gray-300 border-gray-700"
                      }`}
                    >
                      {showGuidelines ? "✓ Ẩn trục căn chỉnh" : "Hiện trục căn chỉnh"}
                    </button>

                    {/* ─── THE FIXED RING (Pedestal) — 1:1 geometry match ─── */}
                    <div
                      className="absolute pointer-events-none select-none"
                      style={{
                        left: "50%",
                        bottom: "45px",
                        width: "min(380px, 75%)",
                        height: "110px",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="absolute inset-0 bg-[#F5B800]/20 blur-[45px] rounded-[50%]" />
                      <div className="absolute top-3 w-[98%] left-[1%] h-[90%] rounded-[50%] bg-[#0A0B0D] border-b-[8px] border-b-[#8B6A00]" />
                      <div className="relative w-full h-full rounded-[50%] bg-[#0E0F11] border-[3px] border-[#F5B800] shadow-[0_0_40px_rgba(245,184,0,0.45)] flex items-center justify-center">
                        <div className="w-[88%] h-[80%] rounded-[50%] bg-[#141517] border border-[#2A2B30]" />
                      </div>
                    </div>

                    {/* ─── DRAGGABLE PRODUCT IMAGE — 1:1 base container (300px x 360px) ─── */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, "image")}
                      className={`absolute z-20 cursor-grab active:cursor-grabbing group ${
                        draggingTarget === "image" ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-black rounded-lg" : ""
                      }`}
                      style={{
                        left: `calc(50% + ${form.displaySettings.imageX}%)`,
                        top: `calc(45% + ${form.displaySettings.imageY}%)`,
                        transform: "translate(-50%, -50%)",
                        width: "300px",
                        height: "360px",
                      }}
                      title="Bấm và Kéo chuột để đặt Balo vừa vặn đĩa 3D!"
                    >
                      <div
                        className="w-full h-full flex items-center justify-center pointer-events-none"
                        style={{
                          transform: `scale(${form.displaySettings.imageScale / 100})`,
                        }}
                      >
                        <img
                          src={previewImageSrc}
                          alt="Preview Balo"
                          className="w-full h-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)]"
                        />
                      </div>

                      {/* Drag overlay indicator */}
                      <div className="absolute inset-0 border-2 border-dashed border-[#F5B800]/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-black/80 text-[#F5B800] text-[10px] font-bold px-2 py-1 rounded shadow">
                          <Move className="w-3 h-3 inline mr-1" />
                          Kéo Balo
                        </span>
                      </div>
                    </div>

                    {/* ─── DRAGGABLE ANNOTATION DOTS & LINES ─── */}
                    <div className="absolute inset-0 z-30 pointer-events-none">
                      {(form.displaySettings.annotations || []).map((ann, i) => {
                        const isSelected = selectedAnnIndex === i;
                        return (
                          <div key={i} className="absolute inset-0 pointer-events-auto">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line
                                x1={ann.dotX}
                                y1={ann.dotY}
                                x2={ann.labelX}
                                y2={ann.labelY}
                                stroke={isSelected ? "#F5B800" : "#D1D5DB"}
                                strokeWidth={isSelected ? "0.6" : "0.3"}
                                strokeDasharray={isSelected ? "none" : "1 0.6"}
                              />
                            </svg>

                            {/* Draggable Dot */}
                            <div
                              onPointerDown={(e) => handlePointerDown(e, i)}
                              className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-125 z-40 ${
                                isSelected ? "bg-[#F5B800] ring-4 ring-[#F5B800]/40 scale-110" : "bg-[#F5B800]/80 hover:bg-[#F5B800]"
                              }`}
                              style={{ left: `${ann.dotX}%`, top: `${ann.dotY}%` }}
                              title={`Chấm chỉ dẫn ${i + 1}: Kéo đến vị trí mong muốn trên balo!`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-black font-bold" />
                            </div>

                            {/* Label Box */}
                            <div
                              onClick={() => setSelectedAnnIndex(i)}
                              className={`absolute text-[11px] px-2 py-0.5 rounded cursor-pointer whitespace-nowrap font-medium transition-all ${
                                isSelected
                                  ? "bg-[#F5B800] text-black font-bold shadow-lg scale-105"
                                  : "bg-black/70 text-gray-200 hover:text-white hover:bg-black border border-white/20"
                              }`}
                              style={{
                                left: `${ann.labelX}%`,
                                top: `${ann.labelY}%`,
                                transform: ann.side === "right" ? "translate(4px, -50%)" : "translate(-100%, -50%) translateX(-4px)",
                              }}
                            >
                              {ann.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nudge & Scale Fine-Tuning Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-gray-50 border border-gray-200 rounded-xl p-4">
                    
                    {/* Directional Nudge Buttons */}
                    <div className="sm:col-span-5 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 shrink-0">Tinh chỉnh vị trí:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => nudgeImage(-1, 0)}
                          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-amber-50 hover:border-amber-400 text-gray-700 transition-colors cursor-pointer"
                          title="Sang trái 1%"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => nudgeImage(0, -1)}
                            className="p-1 bg-white border border-gray-300 rounded hover:bg-amber-50 hover:border-amber-400 text-gray-700 transition-colors cursor-pointer"
                            title="Lên trên 1%"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => nudgeImage(0, 1)}
                            className="p-1 bg-white border border-gray-300 rounded hover:bg-amber-50 hover:border-amber-400 text-gray-700 transition-colors cursor-pointer"
                            title="Xuống dưới 1%"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => nudgeImage(1, 0)}
                          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-amber-50 hover:border-amber-400 text-gray-700 transition-colors cursor-pointer"
                          title="Sang phải 1%"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Scale controls */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 shrink-0">Thu phóng:</span>
                      <button
                        type="button"
                        onClick={() => nudgeScale(-5)}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:bg-amber-50 hover:border-amber-400 text-gray-700 transition-colors cursor-pointer"
                        title="Thu nhỏ 5%"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-amber-600 font-bold text-xs px-1">
                        {form.displaySettings.imageScale}%
                      </span>
                      <button
                        type="button"
                        onClick={() => nudgeScale(5)}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:bg-amber-50 hover:border-amber-400 text-gray-700 transition-colors cursor-pointer"
                        title="Phóng to 5%"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Coordinates Monitor */}
                    <div className="sm:col-span-3 flex items-center justify-end gap-1.5 text-xs font-mono">
                      <span className="bg-white border border-gray-300 px-2 py-0.5 rounded text-gray-700">
                        X:{form.displaySettings.imageX}%
                      </span>
                      <span className="bg-white border border-gray-300 px-2 py-0.5 rounded text-gray-700">
                        Y:{form.displaySettings.imageY}%
                      </span>
                    </div>
                  </div>

                  {/* Selected Annotation Editor Panel */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        Chỉnh sửa Thông số Chỉ dẫn ({form.displaySettings.annotations?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={addAnnotation}
                        className="text-xs text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm điểm chỉ dẫn mới
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {(form.displaySettings.annotations || []).map((ann, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedAnnIndex(i)}
                          className={`p-2.5 border rounded-lg flex flex-wrap items-center gap-2 text-xs transition-colors cursor-pointer ${
                            selectedAnnIndex === i ? "border-amber-500 bg-amber-50/50 shadow-xs" : "border-gray-200 bg-gray-50/50 hover:bg-gray-100"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>

                          <input
                            type="text"
                            value={ann.label}
                            onChange={(e) => updateAnnotation(i, "label", e.target.value)}
                            placeholder="Nhãn thông số"
                            className="flex-1 min-w-[140px] px-2.5 py-1 border border-gray-300 rounded bg-white font-medium"
                          />

                          <select
                            value={ann.side || "right"}
                            onChange={(e) => updateAnnotation(i, "side", e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded bg-white font-medium"
                          >
                            <option value="left">Nhãn Trái</option>
                            <option value="right">Nhãn Phải</option>
                          </select>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAnnotation(i);
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer ml-auto"
                            title="Xóa điểm này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin font-medium" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingCategory ? "Lưu thay đổi & Cập nhật" : "Tạo danh mục"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
