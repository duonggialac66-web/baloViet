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
  LogOut,
  Info,
  PhoneCall,
  ShieldCheck,
  Wand2,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/store/authContext";

interface NavGroup {
  groupName: string;
  items: {
    href: string;
    label: string;
    icon: any;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: "📊 KINH DOANH & VẬN HÀNH",
    items: [
      { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
      { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
      { href: "/admin/danh-muc", label: "Danh mục", icon: Tags },
      { href: "/admin/khach-hang", label: "Khách hàng", icon: Users },
    ]
  },
  {
    groupName: "💬 INTERACTION & MARKETING",
    items: [
      { href: "/admin/danh-gia", label: "Đánh giá", icon: MessageSquare },
      { href: "/admin/uu-dai", label: "Ưu đãi & Hero Studio", icon: TicketPercent, badge: "HOT" },
    ]
  },
  {
    groupName: "⚙️ NỘI DUNG & TRANG",
    items: [
      { href: "/admin/blog", label: "Quản lý Blog & Tin tức", icon: BookOpen },
      { href: "/admin/ve-chung-toi", label: "Trang Về chúng tôi", icon: Info },
      { href: "/admin/lien-he", label: "Trang Liên hệ", icon: PhoneCall },
      { href: "/admin/cam-ket", label: "Cam kết thương hiệu", icon: ShieldCheck },
    ]
  },
  {
    groupName: "✨ CÔNG CỤ AI",
    items: [
      { href: "/admin/xoa-phong", label: "AI Xóa phông PNG", icon: Wand2, badge: "AI" },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#0D0F12] text-gray-200 flex flex-col min-h-screen border-r border-[#1E2228] select-none font-sans shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[#1E2228] bg-[#0A0B0E]/60 backdrop-blur-md">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#F5B800] text-black font-black flex items-center justify-center font-display text-sm shadow-[0_0_12px_rgba(245,184,0,0.4)] group-hover:scale-105 transition-transform">
            BV
          </div>
          <div>
            <span className="text-base font-extrabold tracking-wider text-white font-syne group-hover:text-[#F5B800] transition-colors">
              BALO VIỆT
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-[#F5B800] font-mono leading-none">
              TRUNG TÂM QUẢN TRỊ
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {/* Group Label */}
            <h3 className="px-3 text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500 mb-1">
              {group.groupName}
            </h3>

            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                        isActive
                          ? "bg-[#F5B800]/15 text-[#F5B800] border border-[#F5B800]/40 shadow-[0_0_15px_rgba(245,184,0,0.15)] font-bold"
                          : "text-gray-400 hover:bg-[#161A20] hover:text-white border border-transparent"
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#F5B800] shadow-[0_0_8px_#F5B800]" />
                      )}

                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isActive ? "text-[#F5B800]" : "text-gray-400 group-hover:text-gray-200"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              item.badge === "AI"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3 h-3 transition-all ${
                            isActive
                              ? "text-[#F5B800] opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                          }`}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Logout Button */}
      <div className="p-3 border-t border-[#1E2228] bg-[#0A0B0E]/60 backdrop-blur-md">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-xs font-semibold text-gray-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 rounded-xl border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Đăng xuất hệ thống</span>
        </button>
      </div>
    </aside>
  );
}
