import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/schema";
import { ne, desc, eq, count, sum } from "drizzle-orm";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "Quản lý Khách hàng - Admin" };

export default async function AdminCustomersPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") redirect("/dang-nhap?redirect=/admin/khach-hang");

  const customers = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(ne(users.role, "admin"))
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Khách hàng</h1>
        <p className="text-gray-500 mt-2">{customers.length} khách hàng đã đăng ký.</p>
      </div>

      <DataTable
        data={customers}
        keyExtractor={(item) => item.id}
        columns={[
          { header: "Họ tên", key: "fullName", render: (item) => <span className="font-medium">{item.fullName}</span> },
          { header: "Email", key: "email" },
          { header: "SĐT", key: "phone", render: (item) => item.phone || "—" },
          { header: "Ngày ĐK", key: "createdAt", render: (item) => new Date(item.createdAt!).toLocaleDateString("vi-VN") },
          { header: "Trạng thái", key: "isActive", render: (item) => (
            <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {item.isActive ? "Hoạt động" : "Đã khóa"}
            </span>
          )},
          { header: "", key: "actions", render: (item) => (
            <Link href={`/admin/khach-hang/${item.id}`} className="text-amber-600 hover:underline text-sm">Chi tiết</Link>
          )},
        ]}
      />
    </div>
  );
}
