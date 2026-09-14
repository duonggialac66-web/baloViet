"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/store/cartContext";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { addToast } = useToast();

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Không thể tải danh sách địa chỉ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setProvince("");
    setDistrict("");
    setWard("");
    setStreet("");
    setIsDefault(false);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setProvince(addr.province);
    setDistrict(addr.district);
    setWard(addr.ward);
    setStreet(addr.street);
    setIsDefault(addr.isDefault);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (fullName.trim().length < 2) {
      setFormError("Họ tên phải từ 2 ký tự");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setFormError("Số điện thoại phải gồm 10 chữ số");
      return;
    }
    if (!province.trim() || !district.trim() || !ward.trim() || !street.trim()) {
      setFormError("Vui lòng điền đầy đủ địa chỉ");
      return;
    }

    setIsSaving(true);
    const body = { fullName, phone, province, district, ward, street, isDefault };

    try {
      let res;
      if (editingAddress) {
        // Edit existing
        res = await fetch(`/api/user/addresses/${editingAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // Create new
        res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();

      if (res.ok) {
        addToast(editingAddress ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công", "success");
        setShowModal(false);
        fetchAddresses();
      } else {
        setFormError(data.error || "Không thể lưu địa chỉ");
      }
    } catch (err) {
      console.error(err);
      setFormError("Đã xảy ra lỗi kết nối");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("Xóa địa chỉ thành công", "success");
        fetchAddresses();
      } else {
        const data = await res.json();
        addToast(data.error || "Không thể xóa địa chỉ", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Lỗi kết nối", "error");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}/default`, {
        method: "PUT",
      });

      if (res.ok) {
        addToast("Đặt địa chỉ mặc định thành công", "success");
        fetchAddresses();
      } else {
        const data = await res.json();
        addToast(data.error || "Không thể thay đổi", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Lỗi kết nối", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-tight">
            Sổ địa chỉ
          </h1>
          <div className="w-12 h-1 bg-brand-gold mt-2" />
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gold hover:bg-white text-black font-display font-bold uppercase tracking-widest text-xs px-4 py-2.5 rounded transition-colors"
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-brand-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-brand-muted/20 border border-brand-border rounded-lg p-16 text-center text-brand-subdued font-body text-sm">
          Bạn chưa có địa chỉ giao hàng nào trong sổ địa chỉ.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-brand-muted/20 border rounded-lg p-5 flex flex-col justify-between gap-4 transition-colors ${
                addr.isDefault ? "border-brand-gold/60" : "border-brand-border"
              }`}
            >
              <div className="space-y-1.5 font-body text-sm text-brand-cream">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-brand-subdued text-xs">SĐT: {addr.phone}</p>
                <p className="text-xs mt-1">
                  {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-brand-border/40 pt-3 mt-1 flex-wrap gap-2 text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-brand-gold hover:underline font-body font-medium"
                    >
                      Đặt mặc định
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-white hover:text-brand-gold transition-colors font-body font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-400 hover:text-red-300 transition-colors font-body font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-fadeup">
            <div className="bg-brand-muted/40 px-6 py-4 border-b border-brand-border flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-subdued hover:text-white transition-colors text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-200 text-xs rounded text-center">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-white border border-brand-border text-black px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-white border border-brand-border text-black px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
                    Tỉnh / TP *
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                    placeholder="Hà Nội"
                    className="w-full bg-white border border-brand-border text-black px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
                    Quận / Huyện *
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    placeholder="Cầu Giấy"
                    className="w-full bg-white border border-brand-border text-black px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
                    Phường / Xã *
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    required
                    placeholder="Dịch Vọng"
                    className="w-full bg-white border border-brand-border text-black px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
                  Địa chỉ chi tiết (Số nhà, Tên đường) *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  placeholder="Số 10, Đường Xuân Thủy"
                  className="w-full bg-white border border-brand-border text-black px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="text-black accent-brand-gold h-4 w-4 rounded"
                />
                <label htmlFor="isDefault" className="text-xs text-brand-cream font-body select-none">
                  Đặt địa chỉ này làm mặc định
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/60 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-brand-border hover:bg-brand-muted text-white font-display font-bold uppercase tracking-widest text-xs px-5 py-2.5 rounded transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-gold hover:bg-white text-black font-display font-bold uppercase tracking-widest text-xs px-5 py-2.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
