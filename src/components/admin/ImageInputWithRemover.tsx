"use client";

import { useState } from "react";
import { Sparkles, Upload, Eye, Image as ImageIcon, Trash2 } from "lucide-react";
import BackgroundRemoverModal from "@/components/admin/BackgroundRemoverModal";

interface ImageInputWithRemoverProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export default function ImageInputWithRemover({
  label = "Đường dẫn hình ảnh",
  name = "imageUrl",
  value,
  onChange,
  placeholder = "Nhập URL ảnh hoặc tải từ máy tính...",
  required = false,
  helpText,
}: ImageInputWithRemoverProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {/* Label and Action Buttons Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm"
          title="Tự động xóa nền ảnh và tạo PNG trong suốt"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Xóa phông ảnh (Tạo PNG)</span>
        </button>
      </div>

      {/* Input Group & Upload */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 p-1 rounded"
              title="Xóa đường dẫn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Local File Upload Button */}
        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Tải file</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="text-black hidden"
          />
        </label>
      </div>

      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}

      {/* Image Preview Box with Background Removal Trigger */}
      {value && (
        <div className="mt-3 flex items-start gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="relative w-24 h-24 rounded-md border border-gray-300 bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:12px_12px] flex items-center justify-center p-1 overflow-hidden shrink-0">
            <img
              src={value}
              alt="Xem trước"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
              Xem trước hình ảnh
            </p>
            <p className="text-[11px] text-gray-500 truncate max-w-md font-mono">
              {value.startsWith("data:") ? "[Đã nhúng PNG Base64 trong suốt]" : value}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Chỉnh sửa / Xóa phông lại ảnh này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Instance */}
      <BackgroundRemoverModal
        isOpen={modalOpen}
        initialImageUrl={value}
        onClose={() => setModalOpen(false)}
        onApply={(transparentPngDataUrl) => {
          onChange(transparentPngDataUrl);
        }}
      />
    </div>
  );
}
