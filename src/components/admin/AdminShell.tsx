"use client";

import { useState } from "react";
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
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Home
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

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  let pageTitle = "Tổng quan";
  if (pathname.includes("/don-hang")) pageTitle = "Quản lý đơn hàng";
  else if (pathname.includes("/san-pham")) pageTitle = "Quản lý sản phẩm";
  else if (pathname.includes("/khach-hang")) pageTitle = "Quản lý khách hàng";
  else if (pathname.includes("/danh-muc")) pageTitle = "Quản lý danh mục";
  else if (pathname.includes("/danh-gia")) pageTitle = "Quản lý đánh giá";
  else if (pathname.includes("/uu-dai")) pageTitle = "Quản lý ưu đãi";
  else if (pathname.includes("/xoa-phong")) pageTitle = "Studio xóa phông";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <Link href="/admin" className="text-xl font-bold tracking-wider text-amber-500">
            BALO VIỆT ADMIN
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                      isActive 
                        ? "bg-amber-600 text-white" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 lg:w-64"
              />
            </div>

            <Link href="/" className="text-gray-500 hover:text-amber-500 transition-colors p-1" title="Về trang chủ">
              <Home className="w-5 h-5" />
            </Link>

            <button className="text-gray-500 hover:text-amber-500 relative transition-colors p-1">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">3</span>
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 border-l border-gray-200 pl-3 sm:pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px]">{user?.fullName || "Admin"}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px]">{user?.email || "admin"}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
                {user?.fullName?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
