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
      <div className="flex justify-between items-center bg-[#121417] p-6 rounded-2xl border border-[#22242B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">Quản lý Khách hàng</h1>
          <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 font-sans">{customers.length} khách hàng đã đăng ký tài khoản.</p>
        </div>
      </div>

      <DataTable
        data={customers}
        keyExtractor={(item) => item.id}
        columns={[
          { header: "Họ tên", key: "fullName", render: (item) => <span className="font-bold text-white font-sans text-xs">{item.fullName}</span> },
          { header: "Email", key: "email", render: (item) => <span className="font-mono text-xs text-[#9CA3AF]">{item.email}</span> },
          { header: "SĐT", key: "phone", render: (item) => <span className="font-mono text-xs text-[#9CA3AF]">{item.phone || "—"}</span> },
          { header: "Ngày ĐK", key: "createdAt", render: (item) => <span className="font-mono text-xs text-[#9CA3AF]">{new Date(item.createdAt!).toLocaleDateString("vi-VN")}</span> },
          { header: "Trạng thái", key: "isActive", render: (item) => (
            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md uppercase border ${
              item.isActive 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}>
              {item.isActive ? "Hoạt động" : "Đã khóa"}
            </span>
          )},
          { header: "", key: "actions", render: (item) => (
            <Link href={`/admin/khach-hang/${item.id}`} className="text-[#F5B800] hover:underline font-mono text-xs font-bold">Chi tiết &rarr;</Link>
          )},
        ]}
      />
    </div>
  );
}
