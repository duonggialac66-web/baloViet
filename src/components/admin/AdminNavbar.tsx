"use client";

import { useAuth } from "@/store/authContext";
import { usePathname } from "next/navigation";
import { Bell, Search, Home } from "lucide-react";
import Link from "next/link";

export default function AdminNavbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // A simple title based on pathname
  let pageTitle = "Tổng quan";
  if (pathname.includes("/don-hang")) pageTitle = "Quản lý đơn hàng";
  else if (pathname.includes("/san-pham")) pageTitle = "Quản lý sản phẩm";
  else if (pathname.includes("/khach-hang")) pageTitle = "Quản lý khách hàng";
  else if (pathname.includes("/danh-muc")) pageTitle = "Quản lý danh mục";
  else if (pathname.includes("/danh-gia")) pageTitle = "Quản lý đánh giá";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm animate-fadeup">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-64 transition-shadow"
          />
        </div>

        <Link href="/" className="text-gray-500 hover:text-amber-500 transition-colors" title="Về trang chủ">
          <Home className="w-5 h-5" />
        </Link>

        <button className="text-gray-500 hover:text-amber-500 relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">3</span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-gray-500">{user?.email || "admin"}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-amber-600">
            {user?.fullName?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
