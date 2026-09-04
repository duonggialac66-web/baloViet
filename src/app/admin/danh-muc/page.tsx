"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.slug) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", slug: "", description: "" });
    setShowAdd(false);
    fetchCategories();
  };

  const handleUpdate = async (id: string) => {
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });
    setEditingId(null);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "" });
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-500 mt-2">{categories.length} danh mục.</p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm({ name: "", slug: "", description: "" }); }} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium">
          <Plus className="w-5 h-5" /> Thêm danh mục
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Thêm danh mục mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded-md p-2" />
            <input placeholder="Slug (VD: balo-laptop)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-gray-300 rounded-md p-2" />
            <input placeholder="Mô tả (tùy chọn)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-gray-300 rounded-md p-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"><Save className="w-4 h-4" /> Lưu</button>
            <button onClick={() => setShowAdd(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"><X className="w-4 h-4" /> Hủy</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Tên</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Slug</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Mô tả</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Số SP</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                {editingId === cat.id ? (
                  <>
                    <td className="px-6 py-3"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded p-1 w-full" /></td>
                    <td className="px-6 py-3"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-gray-300 rounded p-1 w-full" /></td>
                    <td className="px-6 py-3"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-gray-300 rounded p-1 w-full" /></td>
                    <td className="px-6 py-3">{cat.count}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => handleUpdate(cat.id)} className="text-green-600 hover:underline text-xs">Lưu</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline text-xs">Hủy</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-3 font-medium">{cat.name}</td>
                    <td className="px-6 py-3 text-gray-500">{cat.slug}</td>
                    <td className="px-6 py-3 text-gray-500 max-w-[200px] truncate">{cat.description || "—"}</td>
                    <td className="px-6 py-3">{cat.count}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => startEdit(cat)} className="text-amber-600 hover:underline text-xs"><Pencil className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline text-xs"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
