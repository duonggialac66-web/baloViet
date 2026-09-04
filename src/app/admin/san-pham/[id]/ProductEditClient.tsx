"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import ImageInputWithRemover from "@/components/admin/ImageInputWithRemover";

export default function ProductEditClient({ product }: { product: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: product.name || "",
    sku: product.sku || "",
    categorySlug: product.categorySlug || "balo-laptop",
    price: product.price ? product.price.toString() : "0",
    salePrice: product.salePrice ? product.salePrice.toString() : "",
    stock: product.stock !== undefined ? product.stock.toString() : "0",
    imageUrl: (product.imageIds && product.imageIds.length > 0) ? product.imageIds[0] : (product.imageUrl || ""),
    shortDescription: product.shortDescription || "",
    description: product.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price) || 0,
        salePrice: formData.salePrice ? parseInt(formData.salePrice) : null,
        stock: parseInt(formData.stock) || 0,
        imageIds: formData.imageUrl ? [formData.imageUrl] : [],
        imageAlts: [formData.name],
      };

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Cập nhật thành công!");
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

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/san-pham");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Không thể xóa sản phẩm");
        setIsDeleting(false);
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/san-pham" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sửa Sản phẩm: {product.name}</h1>
        </div>
        <button 
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> {isDeleting ? "Đang xóa..." : "Xóa"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-100">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-100">
          {message}
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
              helpText="Bấm nút 'Xóa phông ảnh' để tạo ảnh PNG trong suốt"
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
              rows={8}
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
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
