"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Home, 
  User as UserIcon,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/store/authContext";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  let pageTitle = "Tổng quan hệ thống";
  if (pathname.includes("/admin/don-hang")) pageTitle = "Quản lý đơn hàng";
  else if (pathname.includes("/admin/san-pham")) pageTitle = "Quản lý sản phẩm";
  else if (pathname.includes("/admin/khach-hang")) pageTitle = "Quản lý khách hàng";
  else if (pathname.includes("/admin/danh-muc")) pageTitle = "Quản lý danh mục";
  else if (pathname.includes("/admin/danh-gia")) pageTitle = "Quản lý đánh giá";
  else if (pathname.includes("/admin/uu-dai")) pageTitle = "Ưu đãi & Hero Studio";
  else if (pathname.includes("/admin/ve-chung-toi")) pageTitle = "Quản lý Trang Về chúng tôi";
  else if (pathname.includes("/admin/lien-he")) pageTitle = "Quản lý Trang Liên hệ";
  else if (pathname.includes("/admin/cam-ket")) pageTitle = "Quản lý Cam kết thương hiệu";
  else if (pathname.includes("/admin/blog")) pageTitle = "Quản lý Blog & Tin tức";
  else if (pathname.includes("/admin/xoa-phong")) pageTitle = "AI Studio Xóa phông PNG";

  return (
    <div className="flex min-h-screen bg-[#0B0D0E] text-white font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Desktop permanently visible, Mobile in Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${
        mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      }`}>
        <AdminSidebar />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[#121417]/90 border-b border-[#1E2228] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-300"
              aria-label="Mở menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-base sm:text-lg font-bold text-white font-syne truncate flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B800] animate-pulse" />
              {pageTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <Link 
              href="/" 
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181A1F] border border-[#2A2D35] hover:border-[#F5B800] text-xs font-mono text-gray-300 hover:text-white transition-all"
              title="Xem website cửa hàng"
            >
              <Home className="w-3.5 h-3.5 text-[#F5B800]" />
              <span className="hidden sm:inline">Xem Website</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 border-l border-[#1E2228] pl-3 sm:pl-5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.fullName || "Quản trị viên"}</p>
                <p className="text-[10px] text-[#F5B800] font-mono uppercase tracking-wider truncate max-w-[120px]">{user?.role || "ADMIN"}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5B800] text-black flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(245,184,0,0.3)] shrink-0">
                {user?.fullName?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Inner Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
