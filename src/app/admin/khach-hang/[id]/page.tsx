import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orders, orderItems } from "@/lib/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import DataTable from "@/components/admin/DataTable";
import { formatPrice } from "@/data/products";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomerToggleButton from "./CustomerToggleButton";

export const metadata = { title: "Chi tiết Khách hàng - Admin" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") redirect("/dang-nhap");

  const { id } = await params;

  const customerResult = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (customerResult.length === 0) notFound();
  const customer = customerResult[0];

  const customerOrders = await db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt));

  const [{ totalSpent }] = await db.select({ totalSpent: sum(orders.total) }).from(orders).where(eq(orders.userId, id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/khach-hang" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Khách hàng: {customer.fullName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold mx-auto">
            {customer.fullName.charAt(0)}
          </div>
          <h2 className="text-center font-bold text-lg">{customer.fullName}</h2>
          <div className="text-sm text-gray-500 space-y-1">
            <p>📧 {customer.email}</p>
            <p>📱 {customer.phone || "Chưa cập nhật"}</p>
            <p>📅 Tham gia: {new Date(customer.createdAt!).toLocaleDateString("vi-VN")}</p>
          </div>
          <CustomerToggleButton customerId={customer.id} initialActive={customer.isActive!} />
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{customerOrders.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-amber-600">{formatPrice(totalSpent ? Number(totalSpent) : 0)}</p>
            </div>
          </div>

          <DataTable
            data={customerOrders}
            keyExtractor={(item) => item.id}
            emptyMessage="Khách hàng chưa có đơn hàng nào."
            columns={[
              { header: "Mã đơn", key: "orderNumber", render: (item) => <span className="font-medium">#{item.orderNumber}</span> },
              { header: "Ngày", key: "createdAt", render: (item) => new Date(item.createdAt!).toLocaleDateString("vi-VN") },
              { header: "Tổng", key: "total", render: (item) => formatPrice(item.total) },
              { header: "TT", key: "status", render: (item) => <StatusBadge status={item.status as any} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
