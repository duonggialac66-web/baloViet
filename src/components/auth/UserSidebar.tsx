"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/authContext";

interface SidebarProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function UserSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { label: "Tổng quan", href: "/tai-khoan", icon: "📊" },
    { label: "Lịch sử đơn hàng", href: "/tai-khoan/don-hang", icon: "📦" },
    { label: "Sổ địa chỉ", href: "/tai-khoan/dia-chi", icon: "📍" },
    { label: "Sản phẩm yêu thích", href: "/tai-khoan/yeu-thich", icon: "❤️" },
    { label: "Đổi mật khẩu", href: "/tai-khoan/doi-mat-khau", icon: "🔑" },
  ];

  return (
    <aside className="w-full lg:w-80 bg-brand-card border border-brand-border rounded-lg p-6 flex flex-col gap-6 h-fit">
      {/* Profile summary */}
      <div className="flex items-center gap-4 pb-6 border-b border-brand-border">
        <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-black font-display font-black text-xl uppercase shadow-lg">
          {user.fullName ? user.fullName[0] : "U"}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-white font-body font-bold text-base truncate">
            {user.fullName}
          </h3>
          <p className="text-brand-subdued font-body text-xs truncate">
            {user.email}
          </p>
          {user.role === "admin" && (
            <span className="inline-block bg-brand-gold/15 text-brand-gold text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mt-1">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/tai-khoan" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-body font-medium tracking-wide transition-colors ${
                isActive
                  ? "bg-brand-gold text-black font-semibold"
                  : "text-brand-subdued hover:text-white hover:bg-brand-muted"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {user.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded text-sm font-body font-medium text-brand-gold hover:text-white hover:bg-brand-gold/10 transition-colors mt-4 border border-dashed border-brand-gold/35"
          >
            <span className="text-base">👑</span>
            <span>Trang quản trị Admin</span>
          </Link>
        )}

        <button
          onClick={() => {
            if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
              logout();
            }
          }}
          className="flex items-center gap-3 px-4 py-3 rounded text-sm font-body font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors mt-6 border-t border-brand-border pt-4 w-full text-left"
        >
          <span className="text-base">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  );
}
