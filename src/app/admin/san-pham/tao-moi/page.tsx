"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import ImageInputWithRemover from "@/components/admin/ImageInputWithRemover";

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Basic form state for MVP
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categorySlug: "balo-laptop",
    price: "",
    salePrice: "",
    stock: "0",
    imageUrl: "",
    shortDescription: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price) || 0,
        salePrice: formData.salePrice ? parseInt(formData.salePrice) : null,
        stock: parseInt(formData.stock) || 0,
        imageIds: formData.imageUrl ? [formData.imageUrl] : [],
        imageAlts: [formData.name],
        // Mock data for required complex fields in schema
        colors: [{ name: "Đen", hex: "#000000" }],
        specifications: { "Chất liệu": "Polyester" },
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/san-pham");
        router.refresh();
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/san-pham" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Thêm Sản phẩm Mới</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="VD: Balo Kanken Classic"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mã SKU *</label>
              <input 
                required
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="VD: KANKEN-CLASSIC-BLK"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
              <select 
                name="categorySlug"
                value={formData.categorySlug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="balo-laptop">Balo Laptop</option>
                <option value="balo-du-lich">Balo Du Lịch</option>
                <option value="balo-hoc-sinh">Balo Học Sinh</option>
                <option value="phu-kien">Phụ kiện</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tồn kho *</label>
              <input 
                required
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Giá gốc (VNĐ) *</label>
              <input 
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Giá khuyến mãi (VNĐ)</label>
              <input 
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <ImageInputWithRemover
              label="Ảnh sản phẩm chính"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={(newUrl) => setFormData((prev) => ({ ...prev, imageUrl: newUrl }))}
              placeholder="/products/balo-abc.png hoặc URL ảnh..."
              helpText="Bấm nút 'Xóa phông ảnh' để tạo ảnh PNG trong suốt, hiển thị đẹp hơn trên website"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả ngắn *</label>
            <textarea 
              required
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết *</label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={5}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> 
            {isSubmitting ? "Đang lưu..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
