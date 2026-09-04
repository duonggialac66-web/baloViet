import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đặt hàng thành công – Balo Việt",
  description: "Cảm ơn bạn đã mua sắm tại Balo Việt",
};

interface SearchParams {
  orderId?: string;
  orderNumber?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DatHangThanhCongPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.orderId;
  const orderNumber = resolvedParams.orderNumber;

  return (
    <main className="min-h-screen pt-28 pb-20 bg-brand-black flex items-center justify-center px-4">
      <div className="bg-brand-card border border-brand-border w-full max-w-lg rounded-lg p-8 text-center space-y-6 shadow-2xl">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg animate-pulse">
          ✓
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-wider">
            Đặt hàng thành công!
          </h1>
          <p className="text-brand-subdued font-body text-sm max-w-sm mx-auto">
            Cảm ơn bạn đã mua hàng tại Balo Việt. Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.
          </p>
        </div>

        {/* Order Details box */}
        {orderNumber && (
          <div className="bg-brand-muted/40 border border-brand-border/60 rounded p-4 font-body text-xs space-y-2 text-brand-subdued max-w-xs mx-auto">
            <div className="flex justify-between">
              <span>Mã đơn hàng:</span>
              <span className="text-white font-mono font-bold">#{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Trạng thái:</span>
              <span className="text-yellow-500 font-bold">Chờ xác nhận</span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {orderId && (
            <Link
              href={`/tai-khoan/don-hang/${orderId}`}
              className="bg-brand-gold hover:bg-white text-black font-display font-bold uppercase tracking-widest text-xs px-6 py-3 rounded transition-all duration-300"
            >
              Chi tiết đơn hàng
            </Link>
          )}
          <Link
            href="/san-pham"
            className="border border-brand-border hover:bg-brand-muted text-white font-display font-bold uppercase tracking-widest text-xs px-6 py-3 rounded transition-all duration-300"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </main>
  );
}
