import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { desc } from "drizzle-orm";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatPrice } from "@/data/products";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quản lý Đơn hàng - Admin",
};

export default async function AdminOrdersPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/don-hang");
  }

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 mt-2">Xem và cập nhật trạng thái các đơn hàng của khách hàng.</p>
        </div>
      </div>

      <DataTable
        data={allOrders}
        keyExtractor={(item) => item.id}
        columns={[
          { header: "Mã Đơn", key: "orderNumber", render: (item) => <span className="font-medium">#{item.orderNumber}</span> },
          { header: "Khách Hàng", key: "customerName", render: (item) => (
            <div>
              <p className="font-medium text-gray-900">{item.customerName}</p>
              <p className="text-xs text-gray-500">{item.customerPhone}</p>
            </div>
          ) },
          { header: "Ngày Đặt", key: "createdAt", render: (item) => new Date(item.createdAt!).toLocaleString('vi-VN') },
          { header: "Tổng Tiền", key: "total", render: (item) => <span className="text-amber-600 font-medium">{formatPrice(item.total)}</span> },
          { header: "Thanh toán", key: "paymentStatus", render: (item) => (
             <span className={`px-2 py-1 text-xs rounded-full ${item.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
               {item.paymentStatus === 'paid' ? 'Đã TT' : 'Chưa TT'}
             </span>
          )},
          { header: "Trạng Thái", key: "status", render: (item) => <StatusBadge status={item.status as any} /> },
          {
            header: "Thao tác",
            key: "actions",
            render: (item) => (
              <Link 
                href={`/admin/don-hang/${item.id}`} 
                className="inline-flex items-center justify-center px-3 py-1.5 border border-amber-600 text-amber-600 hover:bg-amber-50 rounded-md text-sm font-medium transition-colors"
              >
                Chi tiết
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
