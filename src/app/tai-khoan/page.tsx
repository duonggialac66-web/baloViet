import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, wishlistItems, productReviews } from "@/lib/schema";
import { and, eq, sql, desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TaiKhoanDashboard() {
  const { user } = await getSession();

  if (!user) {
    redirect("/dang-nhap");
  }

  // Fetch dashboard summary stats
  let totalOrders = 0;
  let shippingOrders = 0;
  let wishlistCount = 0;
  let reviewsCount = 0;
  let recentOrdersList: any[] = [];

  try {
    // Total orders count
    const ordersRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, user.id));
    totalOrders = Number(ordersRes[0]?.count || 0);

    // Orders currently shipping
    const shippingRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user.id),
          eq(orders.status, "shipping")
        )
      );
    shippingOrders = Number(shippingRes[0]?.count || 0);

    // Wishlist items count
    const wishlistRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, user.id));
    wishlistCount = Number(wishlistRes[0]?.count || 0);

    // Reviews count
    const reviewsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(productReviews)
      .where(eq(productReviews.userId, user.id));
    reviewsCount = Number(reviewsRes[0]?.count || 0);

    // Fetch top 3 recent orders
    recentOrdersList = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(3);
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    // Silent fail if tables aren't created yet or other DB errors occur during initialization
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

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-tight">
          Xin chào, {user.fullName}!
        </h1>
        <p className="text-brand-subdued text-sm font-body mt-1">
          Quản lý thông tin tài khoản, kiểm tra trạng thái đơn hàng và các sản phẩm yêu thích của bạn.
        </p>
        <div className="w-12 h-1 bg-brand-gold mt-4" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-muted/40 border border-brand-border rounded-lg p-5 text-center">
          <div className="text-2xl mb-1">📦</div>
          <div className="font-display font-black text-2xl text-white">{totalOrders}</div>
          <div className="text-xs font-body text-brand-subdued uppercase tracking-wider mt-1">Đơn hàng</div>
        </div>

        <div className="bg-brand-muted/40 border border-brand-border rounded-lg p-5 text-center">
          <div className="text-2xl mb-1">🚚</div>
          <div className="font-display font-black text-2xl text-white">{shippingOrders}</div>
          <div className="text-xs font-body text-brand-subdued uppercase tracking-wider mt-1">Đang giao</div>
        </div>

        <div className="bg-brand-muted/40 border border-brand-border rounded-lg p-5 text-center">
          <div className="text-2xl mb-1">❤️</div>
          <div className="font-display font-black text-2xl text-white">{wishlistCount}</div>
          <div className="text-xs font-body text-brand-subdued uppercase tracking-wider mt-1">Yêu thích</div>
        </div>

        <div className="bg-brand-muted/40 border border-brand-border rounded-lg p-5 text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="font-display font-black text-2xl text-white">{reviewsCount}</div>
          <div className="text-xs font-body text-brand-subdued uppercase tracking-wider mt-1">Đánh giá</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">
            Đơn hàng gần đây
          </h2>
          <Link
            href="/tai-khoan/don-hang"
            className="text-xs text-brand-gold font-body hover:underline"
          >
            Xem tất cả đơn hàng →
          </Link>
        </div>

        {recentOrdersList.length === 0 ? (
          <div className="bg-brand-muted/20 border border-brand-border rounded-lg p-10 text-center text-brand-subdued font-body text-sm">
            Bạn chưa có đơn hàng nào tại Balo Việt.
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
            <table className="w-full text-left text-sm font-body border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-brand-border text-brand-subdued text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4">Tổng tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 block md:table-row-group">
                {recentOrdersList.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-muted/10 transition-colors block md:table-row mb-4 md:mb-0 border border-brand-border md:border-none rounded-lg md:rounded-none">
                    <td className="py-3 px-4 md:py-4 md:px-4 font-mono text-white text-xs font-bold block md:table-cell flex justify-between items-center border-b border-brand-border/30 md:border-none">
                      <span className="md:hidden text-brand-subdued font-semibold uppercase tracking-wider text-[10px]">Mã đơn</span>
                      <span>#{order.orderNumber}</span>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-4 text-brand-subdued text-xs block md:table-cell flex justify-between items-center border-b border-brand-border/30 md:border-none">
                      <span className="md:hidden text-brand-subdued font-semibold uppercase tracking-wider text-[10px]">Ngày đặt</span>
                      <span>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-4 text-white font-semibold block md:table-cell flex justify-between items-center border-b border-brand-border/30 md:border-none">
                      <span className="md:hidden text-brand-subdued font-semibold uppercase tracking-wider text-[10px]">Tổng tiền</span>
                      <span>{formatPrice(order.total)}</span>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-4 block md:table-cell flex justify-between items-center border-b border-brand-border/30 md:border-none">
                      <span className="md:hidden text-brand-subdued font-semibold uppercase tracking-wider text-[10px]">Trạng thái</span>
                      <span>{getStatusBadge(order.status)}</span>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-4 text-right block md:table-cell flex justify-end items-center">
                      <Link
                        href={`/tai-khoan/don-hang/${order.id}`}
                        className="text-xs text-brand-gold hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
