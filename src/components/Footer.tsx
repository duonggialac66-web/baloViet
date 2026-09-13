"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#0B0D0E] border-t border-[#2A2C2F]">
      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-white text-2xl uppercase">BALO</span>
                <span className="font-display font-black text-[#F5B800] text-2xl uppercase">VIỆT</span>
              </div>
              <p className="text-[#6B6E72] text-[9px] tracking-[0.2em] uppercase mt-0.5">
                Đồng hành trên mọi hành trình
              </p>
            </Link>
            <p className="text-[#6B6E72] text-sm leading-relaxed mb-6 max-w-xs">
              Không chỉ là một chiếc balo. Đó là người bạn đồng hành trên mọi hành trình của bạn.
            </p>
            <div className="flex items-center gap-4">
              {[
                { name: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { name: "Instagram", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                { name: "TikTok", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.2 8.2 0 004.83 1.55V6.62a4.85 4.85 0 01-1.06.07z" },
                { name: "YouTube", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="text-[#6B6E72] hover:text-[#F5B800] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider mb-4">
              Đăng ký nhận tin
            </h3>
            <p className="text-[#6B6E72] text-sm mb-4 leading-relaxed">
              Nhận ngay ưu đãi và thông tin sản phẩm mới nhất!
            </p>
            {submitted ? (
              <p className="text-[#F5B800] font-display font-bold text-sm uppercase tracking-wider">
                Cảm ơn bạn đã đăng ký!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  required
                  className="flex-1 bg-[#1E2022] border border-[#2A2C2F] text-white text-sm px-3 py-2.5 outline-none placeholder:text-[#6B6E72] focus:border-[#F5B800] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#F5B800] text-black px-4 hover:bg-white transition-colors flex items-center"
                  aria-label="Đăng ký"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            )}
          </div>

          {/* About */}
          <div>
            <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider mb-4">
              Về chúng tôi
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Giới thiệu", href: "/ve-chung-toi" },
                { label: "Câu chuyện thương hiệu", href: "/ve-chung-toi#story" },
                { label: "Tuyển dụng", href: "/tuyen-dung" },
                { label: "Blog", href: "/blog" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[#6B6E72] text-sm hover:text-[#F5B800] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider mb-4">
              Hỗ trợ
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Hướng dẫn mua hàng", href: "/chinh-sach/mua-hang" },
                { label: "Câu hỏi thường gặp", href: "/chinh-sach/faq" },
                { label: "Chính sách đổi trả", href: "/chinh-sach/doi-tra" },
                { label: "Chính sách bảo hành", href: "/chinh-sach/bao-hanh" },
                { label: "Chính sách vận chuyển", href: "/chinh-sach/van-chuyen" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[#6B6E72] text-sm hover:text-[#F5B800] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-[#6B6E72] text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-[#F5B800]" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.9v2.02z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <a href="tel:19001234" className="hover:text-[#F5B800] transition-colors">1900 1234</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-[#F5B800]" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <a href="mailto:hello@baloviet.vn" className="hover:text-[#F5B800] transition-colors">hello@baloviet.vn</a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-[#F5B800] mt-0.5" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>123 Đường Balo, Quận 1,<br />TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2A2C2F] px-6 lg:px-10 py-5">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#6B6E72] text-xs">
            © {new Date().getFullYear()} BALO VIỆT. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/chinh-sach/bao-mat" className="text-[#6B6E72] text-xs hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/chinh-sach/dieu-khoan" className="text-[#6B6E72] text-xs hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
