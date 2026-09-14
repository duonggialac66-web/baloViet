"use client";

import { useState } from "react";
import { formatPrice } from "@/data/products";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";
import { ArrowLeft, Save, Printer } from "lucide-react";

export default function OrderDetailsClient({ initialOrder, items }: { initialOrder: any, items: any[] }) {
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(initialOrder.status);
  const [paymentStatus, setPaymentStatus] = useState(initialOrder.paymentStatus);
  const [adminNote, setAdminNote] = useState(initialOrder.adminNote || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setIsUpdating(true);
    setMessage("");
    try {
      // 1. Update status
      if (status !== order.status) {
        await fetch(`/api/admin/orders/${order.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
      }

      // 2. Update payment
      if (paymentStatus !== order.paymentStatus) {
        await fetch(`/api/admin/orders/${order.id}/payment`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus })
        });
      }

      // 3. Update note
      if (adminNote !== order.adminNote) {
        await fetch(`/api/admin/orders/${order.id}/note`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminNote })
        });
      }

      setOrder({ ...order, status, paymentStatus, adminNote });
      setMessage("Đã cập nhật đơn hàng thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Lỗi khi cập nhật đơn hàng.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/don-hang" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Chi tiết đơn hàng #{order.orderNumber}</h1>
            <p className="text-sm text-gray-400">
              Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
           <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" /> In đơn
          </button>
          <button 
            onClick={handleUpdate} 
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes("Lỗi") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Order Items & Customer Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900">Sản phẩm đã mua</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 border border-gray-200 overflow-hidden">
                    {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Màu sắc: {item.color}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium">{formatPrice(item.price)} x {item.quantity}</span>
                      <span className="font-bold text-amber-600">{formatPrice(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phí giao hàng</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Giảm giá</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Tổng cộng</span>
                <span className="text-amber-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900">Thông tin giao hàng</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Họ tên người nhận:</p>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Số điện thoại:</p>
                <p className="font-medium">{order.shippingAddress.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Địa chỉ:</p>
                <p className="font-medium">
                  {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
              <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-500 mb-1">Ghi chú của khách hàng:</p>
                <p className="italic bg-yellow-50 text-gray-800 p-3 rounded border border-yellow-100">{order.note || "Không có ghi chú"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Status Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Quản lý trạng thái</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn hàng</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="text-black w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
                <option value="returned">Hoàn trả</option>
              </select>
              <div className="mt-2">
                <StatusBadge status={status as any} />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                   {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                 </span>
              </div>
              <select 
                value={paymentStatus} 
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="text-black w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú của Admin (Nội bộ)</label>
              <textarea 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ghi chú thêm về đơn hàng này..."
                className="text-black w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
