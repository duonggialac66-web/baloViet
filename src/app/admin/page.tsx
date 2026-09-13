import { getSession } from "@/lib/auth";
import StatsCard from "@/components/admin/StatsCard";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatPrice } from "@/data/products";
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package, 
  TicketPercent, 
  Info, 
  PhoneCall, 
  BookOpen, 
  Wand2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/schema";
import { count, sum, desc, ne } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const { user } = await getSession();

  // Stats fetching from database
  const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(orders);
  const [{ totalRevenue }] = await db.select({ totalRevenue: sum(orders.total) }).from(orders);
  const [{ totalCustomers }] = await db.select({ totalCustomers: count() }).from(users).where(ne(users.role, "admin"));
  const [{ totalProducts }] = await db.select({ totalProducts: count() }).from(products);

  const recentOrders = await db.select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const QUICK_ACTIONS = [
    { title: "Ưu đãi & Hero Studio", desc: "Tùy chỉnh Banner Hero, màu nền & chú thích balo 3D", href: "/admin/uu-dai", icon: TicketPercent, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { title: "Trang Về chúng tôi", desc: "Chỉnh sửa câu chuyện thương hiệu, chỉ số & giá trị cốt lõi", href: "/admin/ve-chung-toi", icon: Info, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { title: "Trang Liên hệ", desc: "Cập nhật Hotline, Email, Địa chỉ cửa hàng & Google Maps", href: "/admin/lien-he", icon: PhoneCall, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { title: "Quản lý Sản phẩm", desc: "Cập nhật danh sách sản phẩm, giá bán & hình ảnh", href: "/admin/san-pham", icon: Package, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { title: "Quản lý Blog", desc: "Đăng cẩm nang du lịch, bài viết chia sẻ & tin tức", href: "/admin/blog", icon: BookOpen, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { title: "AI Xóa phông PNG", desc: "Công cụ tự động xóa phông ảnh balo sản phẩm chuẩn HD", href: "/admin/xoa-phong", icon: Wand2, color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-[#121417] border border-[#22242B] overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5B800]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">
            Xin chào, {user?.fullName || "Admin"}! 👋
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl font-sans">
            Chào mừng trở lại trung tâm quản trị Balo Việt. Kiểm soát đơn hàng, doanh thu, quản lý kho hàng và tùy chỉnh toàn bộ nội dung website của bạn.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Tổng Doanh Thu"
          value={formatPrice(totalRevenue ? Number(totalRevenue) : 0)}
          icon={<DollarSign className="w-6 h-6 text-[#F5B800]" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Tổng Đơn Hàng"
          value={totalOrders}
          icon={<ShoppingCart className="w-6 h-6 text-[#F5B800]" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Khách Hàng"
          value={totalCustomers}
          icon={<Users className="w-6 h-6 text-[#F5B800]" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Sản Phẩm Trong Kho"
          value={totalProducts}
          icon={<Package className="w-6 h-6 text-[#F5B800]" />}
        />
      </div>

      {/* Quick Access Studio Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-syne uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#F5B800]" />
          Lối Tắt Quản Lý Nội Dung & Studio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <Link
                key={idx}
                href={qa.href}
                className="group p-5 rounded-xl bg-[#121417] border border-[#22242B] hover:border-[#F5B800]/50 transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${qa.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#F5B800] group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#F5B800] transition-colors">
                    {qa.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-sans leading-relaxed">
                    {qa.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#121417] border border-[#22242B] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#1E2228] pb-4">
          <h2 className="text-lg font-bold text-white font-syne uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#F5B800]" />
            Đơn hàng mới nhất
          </h2>
          <Link href="/admin/don-hang" className="text-[#F5B800] hover:underline text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <span>Xem tất cả</span> &rarr;
          </Link>
        </div>

        <DataTable
          data={recentOrders}
          keyExtractor={(item) => item.id}
          columns={[
            { header: "Mã Đơn", key: "orderNumber", render: (item) => <span className="font-mono font-bold text-white">#{item.orderNumber}</span> },
            { header: "Khách Hàng", key: "customerName" },
            { header: "Ngày Đặt", key: "createdAt", render: (item) => <span className="font-mono text-xs text-gray-400">{new Date(item.createdAt!).toLocaleDateString('vi-VN')}</span> },
            { header: "Tổng Tiền", key: "total", render: (item) => <span className="text-[#F5B800] font-mono font-bold">{formatPrice(item.total)}</span> },
            { header: "Trạng Thái", key: "status", render: (item) => <StatusBadge status={item.status as any} /> },
            {
              header: "",
              key: "actions",
              render: (item) => (
                <Link href={`/admin/don-hang/${item.id}`} className="text-xs font-mono text-[#F5B800] hover:underline font-bold">
                  Chi tiết &rarr;
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
