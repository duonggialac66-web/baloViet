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
      <div className="flex justify-between items-center bg-[#121417] p-6 rounded-2xl border border-[#22242B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">Quản lý Đơn hàng</h1>
          <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 font-sans">Xem và cập nhật trạng thái các đơn hàng của khách hàng.</p>
        </div>
      </div>

      <DataTable
        data={allOrders}
        keyExtractor={(item) => item.id}
        columns={[
          { header: "Mã Đơn", key: "orderNumber", render: (item) => <span className="font-mono font-bold text-white">#{item.orderNumber}</span> },
          { header: "Khách Hàng", key: "customerName", render: (item) => (
            <div>
              <p className="font-bold text-white font-sans text-xs">{item.customerName}</p>
              <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{item.customerPhone}</p>
            </div>
          ) },
          { header: "Ngày Đặt", key: "createdAt", render: (item) => <span className="font-mono text-xs text-[#9CA3AF]">{new Date(item.createdAt!).toLocaleString('vi-VN')}</span> },
          { header: "Tổng Tiền", key: "total", render: (item) => <span className="text-[#F5B800] font-mono font-bold text-xs">{formatPrice(item.total)}</span> },
          { header: "Thanh toán", key: "paymentStatus", render: (item) => (
             <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md uppercase border ${
               item.paymentStatus === 'paid' 
                 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                 : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
             }`}>
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
                className="inline-flex items-center justify-center px-3 py-1.5 border border-[#F5B800]/40 text-[#F5B800] hover:bg-[#F5B800]/15 rounded-lg text-xs font-bold font-sans transition-colors"
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
