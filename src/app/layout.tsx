import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Syne, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ToastContainer from "@/components/Toast";
import { CartProvider, ToastProvider } from "@/store/cartContext";
import { AuthProvider } from "@/store/authContext";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baloviet.vn"),
  title: {
    template: "%s | Balo Việt",
    default: "Balo Việt – Balo Laptop, Du lịch, Học sinh Cao Cấp Chính Hãng",
  },
  description: "Balo Việt – thương hiệu balo chính hãng Việt Nam. Balo laptop chống nước IPX6, balo du lịch 40L, balo học sinh bền đẹp. Bảo hành 24 tháng, giao hàng toàn quốc miễn phí.",
  keywords: ["balo việt", "balo laptop chống nước", "balo du lịch", "balo học sinh", "balo chính hãng việt nam"],
  openGraph: {
    type: "website", locale: "vi_VN", siteName: "Balo Việt",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Balo Việt" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "https://baloviet.vn" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Balo Việt",
  url: "https://baloviet.vn",
  logo: "https://baloviet.vn/logo.png",
  contactPoint: { "@type": "ContactPoint", telephone: "1900-1234", contactType: "customer service" },
  sameAs: ["https://facebook.com/baloviet", "https://instagram.com/baloviet"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasSession = !!cookieStore.get("baloviet_session")?.value;

  return (
    <html lang="vi">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className={`${barlowCondensed.variable} ${inter.variable} ${syne.variable} ${spaceGrotesk.variable} bg-[#0B0D0E] min-h-screen flex flex-col overflow-x-hidden`}>
        <ToastProvider>
          <AuthProvider hasSession={hasSession}>
            <CartProvider>
              <Header />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
              <CartDrawer />
              <ToastContainer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

