"use client";

import React, { useState, useEffect } from "react";
import { useCart, useToast } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";

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

export default function CheckoutClient() {
  const { items, totalPrice, clear } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load saved addresses if user is logged in
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");

      fetch("/api/user/addresses")
        .then((res) => (res.ok ? res.json() : { addresses: [] }))
        .then((data) => {
          const list = data.addresses || [];
          setAddresses(list);
          const defaultAddr = list.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            applyAddressFields(defaultAddr);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const applyAddressFields = (addr: Address) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setProvince(addr.province);
    setDistrict(addr.district);
    setWard(addr.ward);
    setStreet(addr.street);
  };

  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setFullName(user?.fullName || "");
      setPhone(user?.phone || "");
      setProvince("");
      setDistrict("");
      setWard("");
      setStreet("");
    } else {
      const addr = addresses.find((a) => a.id === id);
      if (addr) {
        applyAddressFields(addr);
      }
    }
  };

  const shippingFee = totalPrice >= 1000000 || totalPrice === 0 ? 0 : 30000;
  const totalAmount = totalPrice + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (items.length === 0) {
      addToast("Giỏ hàng của bạn đang trống!", "error");
      return;
    }

    if (fullName.trim().length < 2) {
      setFormError("Họ tên nhận hàng phải từ 2 ký tự");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setFormError("Số điện thoại nhận hàng phải gồm 10 chữ số");
      return;
    }

    if (!province.trim() || !district.trim() || !ward.trim() || !street.trim()) {
      setFormError("Vui lòng nhập đầy đủ địa chỉ giao hàng");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      items: items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images?.[0]?.url || item.product.imageIds?.[0] || "",
        productSlug: item.product.slug,
        color: item.color,
        colorHex: item.colorHex,
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName,
        phone,
        province,
        district,
        ward,
        street,
      },
      customerEmail: user?.email || `guest_${Date.now()}@baloviet.vn`, // Default email structure for guest checkouts
      customerPhone: phone,
      customerName: fullName,
      paymentMethod,
      note,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Đặt hàng thành công!", "success");
        clear(); // clear cart
        router.push(`/dat-hang-thanh-cong?orderId=${data.orderId}&orderNumber=${data.orderNumber}`);
      } else {
        setFormError(data.error || "Đã xảy ra lỗi khi tạo đơn hàng");
        addToast(data.error || "Đặt hàng thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      setFormError("Đã xảy ra lỗi kết nối");
      addToast("Lỗi mạng khi đặt hàng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-lg p-10 text-center max-w-xl mx-auto space-y-6">
        <div className="text-5xl">🛒</div>
        <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-brand-subdued font-body text-sm">
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.
        </p>
        <Link
          href="/san-pham"
          className="inline-flex bg-brand-gold text-black font-display font-bold uppercase tracking-widest text-xs px-6 py-3 rounded hover:bg-white transition-colors"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Delivery details form (Left panel) */}
      <div className="flex-1 bg-brand-card border border-brand-border rounded-lg p-6 lg:p-8 space-y-6 w-full">
        <div>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            Thông tin giao hàng
          </h2>
          <div className="w-12 h-0.5 bg-brand-gold mt-1" />
        </div>

        {formError && (
          <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-200 text-xs rounded text-center font-body">
            {formError}
          </div>
        )}

        {/* Address Selection dropdown if logged in and has addresses */}
        {user && addresses.length > 0 && (
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-2">
              Chọn địa chỉ đã lưu
            </label>
            <select
              value={selectedAddressId}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2.5 rounded text-sm outline-none focus:border-brand-gold font-body"
            >
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} - {a.phone} ({a.street}, {a.ward}, {a.district}, {a.province})
                </option>
              ))}
              <option value="new">+ Nhập địa chỉ giao hàng mới</option>
            </select>
          </div>
        )}

        {/* Input fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={selectedAddressId !== "new" && addresses.length > 0}
              className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body disabled:opacity-60"
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
              disabled={selectedAddressId !== "new" && addresses.length > 0}
              className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
              Tỉnh / Thành phố *
            </label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
              disabled={selectedAddressId !== "new" && addresses.length > 0}
              placeholder="Ví dụ: Hà Nội"
              className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body disabled:opacity-60"
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
              disabled={selectedAddressId !== "new" && addresses.length > 0}
              placeholder="Ví dụ: Cầu Giấy"
              className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body disabled:opacity-60"
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
              disabled={selectedAddressId !== "new" && addresses.length > 0}
              placeholder="Ví dụ: Dịch Vọng"
              className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
            Số nhà, tên đường *
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
            disabled={selectedAddressId !== "new" && addresses.length > 0}
            placeholder="Ví dụ: Số 12, Ngõ 45 Trần Thái Tông"
            className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body disabled:opacity-60"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-brand-subdued mb-1">
            Ghi chú đơn hàng (Không bắt buộc)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ghi chú về thời gian giao hàng, hướng dẫn tìm nhà..."
            className="w-full bg-brand-muted border border-brand-border text-white px-3 py-2 rounded text-sm outline-none focus:border-brand-gold font-body resize-none"
          />
        </div>

        {/* Payment options */}
        <div className="space-y-3 pt-4 border-t border-brand-border/40">
          <div>
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Phương thức thanh toán
            </h3>
            <div className="w-8 h-0.5 bg-brand-gold mt-1" />
          </div>

          <div className="space-y-2">
            <div
              className={`p-4 border rounded-lg flex items-center gap-3 cursor-pointer select-none transition-colors ${
                paymentMethod === "cod" ? "border-brand-gold bg-brand-muted/20" : "border-brand-border hover:border-white/20"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-brand-gold"
              />
              <div>
                <p className="font-body text-xs font-bold text-white uppercase tracking-wider">Thanh toán khi nhận hàng (COD)</p>
                <p className="text-[11px] font-body text-brand-subdued mt-0.5">
                  Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.
                </p>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg flex items-center gap-3 cursor-pointer select-none transition-colors ${
                paymentMethod === "bank_transfer" ? "border-brand-gold bg-brand-muted/20" : "border-brand-border hover:border-white/20"
              }`}
              onClick={() => setPaymentMethod("bank_transfer")}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
                className="accent-brand-gold"
              />
              <div>
                <p className="font-body text-xs font-bold text-white uppercase tracking-wider">Chuyển khoản qua Ngân hàng</p>
                <p className="text-[11px] font-body text-brand-subdued mt-0.5">
                  Chuyển tiền vào tài khoản ngân hàng của Balo Việt. Đơn hàng sẽ được xử lý ngay sau khi nhận được tiền thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary Panel (Right side) */}
      <div className="w-full lg:w-96 bg-brand-card border border-brand-border rounded-lg p-6 lg:p-8 space-y-6 shrink-0">
        <div>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            Đơn hàng của bạn
          </h2>
          <div className="w-12 h-0.5 bg-brand-gold mt-1" />
        </div>

        {/* Order items mini summary */}
        <div className="divide-y divide-brand-border/40 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.color}`} className="py-3 flex gap-3 text-sm font-body">
              <div className="w-12 h-12 rounded bg-brand-muted border border-brand-border/40 shrink-0 overflow-hidden flex items-center justify-center text-xl">
                {item.product.imageIds && item.product.imageIds.length > 0 ? (
                  <CloudinaryImage
                    publicId={item.product.imageIds[0]}
                    alt={item.product.name}
                    width={50}
                    height={50}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🎒"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{item.product.name}</p>
                <p className="text-brand-subdued text-xs mt-0.5">
                  Màu: {item.color} • SL: {item.quantity}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-brand-gold font-semibold">
                  {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div className="border-t border-brand-border/60 pt-4 space-y-2 text-xs font-body text-brand-subdued">
          <div className="flex justify-between">
            <span>Tạm tính hàng:</span>
            <span className="text-white font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span className="text-white font-medium">
              {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-brand-border/40 pt-3 mt-2">
            <span className="text-white font-display uppercase tracking-wider">Tổng cộng:</span>
            <span className="text-brand-gold text-base">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Order button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gold hover:bg-white text-black font-display font-bold uppercase tracking-widest text-sm py-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang đặt hàng...
            </>
          ) : (
            "Đặt hàng ngay"
          )}
        </button>
      </div>
    </form>
  );
}
