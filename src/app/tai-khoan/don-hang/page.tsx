import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

interface SearchParams {
  status?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DonHangPage({ searchParams }: PageProps) {
  const { user } = await getSession();

  if (!user) {
    redirect("/dang-nhap");
  }

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status;

  let userOrders: any[] = [];

  try {
    let query = db.select().from(orders).where(eq(orders.userId, user.id));

    if (statusFilter && statusFilter !== "all") {
      userOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.userId, user.id),
            eq(orders.status, statusFilter)
          )
        )
        .orderBy(desc(orders.createdAt));
    } else {
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt));
    }
  } catch (error) {
    console.error("Error loading customer orders:", error);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded">Chờ xác nhận</span>;
      case "confirmed":
        return <span className="bg-blue-500/10 text-blue-500 text-xs px-2 py-1 rounded">Đã xác nhận</span>;
      case "processing":
        return <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded">Đang xử lý</span>;
      case "shipping":
        return <span className="bg-indigo-500/10 text-indigo-500 text-xs px-2 py-1 rounded">Đang vận chuyển</span>;
      case "delivered":
        return <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">Đã giao</span>;
      case "completed":
        return <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded">Hoàn thành</span>;
      case "cancelled":
        return <span className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded">Đã hủy</span>;
      default:
        return <span className="bg-brand-muted text-brand-subdued text-xs px-2 py-1 rounded">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <span className="text-red-400 text-xs">Chưa thanh toán</span>;
      case "paid":
        return <span className="text-green-400 text-xs">Đã thanh toán</span>;
      case "refunded":
        return <span className="text-brand-subdued text-xs">Đã hoàn tiền</span>;
      default:
        return <span className="text-brand-subdued text-xs">{status}</span>;
    }
  };

  const filterTabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xác nhận", value: "pending" },
    { label: "Đang vận chuyển", value: "shipping" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-tight">
          Lịch sử đơn hàng
        </h1>
        <div className="w-12 h-1 bg-brand-gold mt-2" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-brand-border overflow-x-auto pb-px">
        {filterTabs.map((tab) => {
          const isActive =
            (!statusFilter && tab.value === "all") || statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/tai-khoan/don-hang${tab.value === "all" ? "" : `?status=${tab.value}`}`}
              className={`px-4 py-3 border-b-2 font-body text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                isActive
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-brand-subdued hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Orders List */}
      {userOrders.length === 0 ? (
        <div className="bg-brand-muted/20 border border-brand-border rounded-lg p-16 text-center text-brand-subdued font-body text-sm">
          Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
          <div className="mt-4">
            <Link
              href="/san-pham"
              className="inline-flex bg-brand-gold text-black font-display font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded hover:bg-white transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-body border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-brand-subdued text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Đơn hàng</th>
                <th className="py-3 px-4">Ngày đặt</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Thanh toán</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {userOrders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-muted/10 transition-colors">
                  <td className="py-4 px-4 font-mono text-white text-xs font-bold">
                    #{order.orderNumber}
                  </td>
                  <td className="py-4 px-4 text-brand-subdued text-xs">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-white font-semibold">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-4 px-4">
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/tai-khoan/don-hang/${order.id}`}
                      className="inline-flex bg-brand-muted border border-brand-border hover:border-brand-gold hover:text-black hover:bg-brand-gold px-3.5 py-1.5 rounded text-xs text-white font-display font-bold uppercase tracking-wider transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
