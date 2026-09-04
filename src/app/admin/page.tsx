import { getSession } from "@/lib/auth";
import StatsCard from "@/components/admin/StatsCard";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatPrice } from "@/data/products";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import Link from "next/link";
// In a real app, these would come from the database
import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/schema";
import { count, sum, desc, ne } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const { user } = await getSession();

  // Basic stats fetching
  const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(orders);
  const [{ totalRevenue }] = await db.select({ totalRevenue: sum(orders.total) }).from(orders);
  const [{ totalCustomers }] = await db.select({ totalCustomers: count() }).from(users).where(ne(users.role, "admin"));
  const [{ totalProducts }] = await db.select({ totalProducts: count() }).from(products);

  const recentOrders = await db.select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 mt-2">Xin chào {user?.fullName}, chào mừng trở lại trang quản trị.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng Doanh Thu"
          value={formatPrice(totalRevenue ? Number(totalRevenue) : 0)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Đơn Hàng"
          value={totalOrders}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Khách Hàng"
          value={totalCustomers}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 2, isPositive: false }}
        />
        <StatsCard
          title="Sản Phẩm"
          value={totalProducts}
          icon={<Package className="w-6 h-6" />}
        />
      </div>

      {/* Recent Orders Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
          <Link href="/admin/don-hang" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
            Xem tất cả &rarr;
          </Link>
        </div>
        <DataTable
          data={recentOrders}
          keyExtractor={(item) => item.id}
          columns={[
            { header: "Mã Đơn", key: "orderNumber", render: (item) => <span className="font-medium">#{item.orderNumber}</span> },
            { header: "Khách Hàng", key: "customerName" },
            { header: "Ngày Đặt", key: "createdAt", render: (item) => new Date(item.createdAt!).toLocaleDateString('vi-VN') },
            { header: "Tổng Tiền", key: "total", render: (item) => <span className="text-amber-600 font-medium">{formatPrice(item.total)}</span> },
            { header: "Trạng Thái", key: "status", render: (item) => <StatusBadge status={item.status as any} /> },
            {
              header: "",
              key: "actions",
              render: (item) => (
                <Link href={`/admin/don-hang/${item.id}`} className="text-gray-500 hover:text-amber-600">
                  Chi tiết
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
