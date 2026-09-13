"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Về chúng tôi", href: "/ve-chung-toi" },
  { label: "Blog", href: "/blog" },
  { label: "Liên hệ", href: "/lien-he" },
];

export default function Header() {
  const { totalItems, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0B0D0E]/95 backdrop-blur-md border-b border-[#2A2C2F]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group" aria-label="BALO VIỆT - Trang chủ">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-white text-2xl lg:text-3xl tracking-tight uppercase leading-none group-hover:text-[#F5B800] transition-colors">
                  BALO
                </span>
                <span className="font-display font-black text-[#F5B800] text-2xl lg:text-3xl tracking-tight uppercase leading-none">
                  VIỆT
                </span>
              </div>
              <p className="text-[#6B6E72] text-[9px] tracking-[0.2em] uppercase font-body leading-none mt-2">
                Đồng hành trên mọi hành trình
              </p>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Menu chính">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-body font-medium uppercase tracking-widest transition-colors duration-150 relative group ${isActive ? "text-[#F5B800]" : "text-white hover:text-[#F5B800]"
                      }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-px bg-[#F5B800] transition-all duration-200 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4 lg:gap-5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-white hover:text-[#F5B800] transition-colors"
                aria-label="Tìm kiếm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* Account */}
              <Link
                href={isAuthenticated ? "/tai-khoan" : "/dang-nhap"}
                className="hidden lg:flex items-center justify-center text-white hover:text-[#F5B800] transition-colors"
                aria-label="Tài khoản"
              >
                {isAuthenticated && user ? (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-amber-500 uppercase border border-gray-700">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.fullName.charAt(0)
                    )}
                  </div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openDrawer}
                className="relative text-white hover:text-[#F5B800] transition-colors"
                aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F5B800] text-black text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-white hover:text-[#F5B800] transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#0B0D0E] border-t border-[#2A2C2F] px-6 py-6">
            <nav className="flex flex-col gap-5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`font-display font-bold text-xl uppercase tracking-wider ${isActive ? "text-[#F5B800]" : "text-white"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={isAuthenticated ? "/tai-khoan" : "/dang-nhap"}
                onClick={() => setMenuOpen(false)}
                className="font-display font-bold text-xl uppercase tracking-wider text-white"
              >
                {isAuthenticated ? "Tài khoản" : "Đăng nhập"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-start justify-center pt-24 sm:pt-32 px-4 sm:px-6">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-transparent border-b-2 border-[#F5B800] text-white font-display font-bold text-xl sm:text-3xl lg:text-4xl uppercase tracking-wider py-3 sm:py-4 pr-12 sm:pr-14 outline-none placeholder:text-[#6B6E72]"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F5B800] hover:text-white transition-colors"
                aria-label="Tìm kiếm"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </form>
            <button
              onClick={() => setSearchOpen(false)}
              className="mt-6 sm:mt-8 text-[#6B6E72] hover:text-white transition-colors text-xs sm:text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Đóng (ESC)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
