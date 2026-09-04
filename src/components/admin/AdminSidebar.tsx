"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Tags, 
  MessageSquare,
  TicketPercent,
  Sparkles,
  LogOut
} from "lucide-react";
import { useAuth } from "@/store/authContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/uu-dai", label: "Ưu đãi & Banner", icon: TicketPercent },
  { href: "/admin/xoa-phong", label: "Xóa phông & PNG", icon: Sparkles },
  { href: "/admin/khach-hang", label: "Khách hàng", icon: Users },
  { href: "/admin/danh-muc", label: "Danh mục", icon: Tags },
  { href: "/admin/danh-gia", label: "Đánh giá", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="h-16 flex items-center justify-center border-b border-gray-800 animate-fadeup">
        <Link href="/admin" className="text-xl font-bold tracking-wider text-amber-500">
          BALO VIỆT ADMIN
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <li key={item.href} className="animate-fadeup" style={{ animationDelay: `${(index + 1) * 75}ms` }}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? "bg-amber-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800 animate-fadeup" style={{ animationDelay: `${(NAV_ITEMS.length + 1) * 75}ms` }}>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
