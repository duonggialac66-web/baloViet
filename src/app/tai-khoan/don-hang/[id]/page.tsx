import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import OrderActions from "@/components/auth/OrderActions";
import CloudinaryImage from "@/components/CloudinaryImage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { user } = await getSession();

  if (!user) {
    redirect("/dang-nhap");
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  let orderData: any = null;
  let itemsList: any[] = [];

  try {
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
      .limit(1);

    if (orderResult.length === 0) {
      notFound();
    }

    orderData = orderResult[0];

    itemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  } catch (error) {
    console.error("Error loading order detail:", error);
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang vận chuyển";
      case "delivered":
        return "Đã giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "confirmed":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "processing":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "shipping":
        return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      case "delivered":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "completed":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "cancelled":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-brand-subdued bg-brand-muted border-brand-border";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "unpaid":
        return "Chưa thanh toán";
      case "paid":
        return "Đã thanh toán";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cod":
        return "Thanh toán COD (khi nhận hàng)";
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb / Back button */}
      <div className="flex justify-between items-center">
        <Link
          href="/tai-khoan/don-hang"
          className="text-brand-subdued hover:text-brand-gold text-xs font-body flex items-center gap-1.5 transition-colors"
        >
          ← Quay lại danh sách đơn hàng
        </Link>
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${getStatusColor(orderData.status)}`}>
          {getStatusText(orderData.status)}
        </span>
      </div>

      {/* Info Header */}
      <div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white uppercase tracking-tight">
          Chi tiết đơn hàng #{orderData.orderNumber}
        </h1>
        <p className="text-brand-subdued text-xs font-body mt-1">
          Đặt lúc: {new Date(orderData.createdAt).toLocaleString("vi-VN")}
        </p>
        <div className="w-12 h-1 bg-brand-gold mt-3" />
      </div>

      {/* Order Info Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping address card */}
        <div className="bg-brand-muted/20 border border-brand-border rounded-lg p-5 space-y-3">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-brand-border/60 pb-2">
            Thông tin giao hàng
          </h3>
          <div className="text-sm font-body space-y-1 text-brand-cream">
            <p className="font-bold text-white">{orderData.shippingAddress.fullName}</p>
            <p className="text-brand-subdued">{orderData.shippingAddress.phone}</p>
            <p>
              {orderData.shippingAddress.street}, {orderData.shippingAddress.ward}
            </p>
            <p>
              {orderData.shippingAddress.district}, {orderData.shippingAddress.province}
            </p>
          </div>
        </div>

        {/* Payment info card */}
        <div className="bg-brand-muted/20 border border-brand-border rounded-lg p-5 space-y-3">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-brand-border/60 pb-2">
            Phương thức thanh toán
          </h3>
          <div className="text-sm font-body space-y-2 text-brand-cream">
            <p className="font-medium">{getPaymentMethodText(orderData.paymentMethod)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-brand-subdued text-xs">Trạng thái:</span>
              <span className={`text-xs font-bold ${orderData.paymentStatus === "paid" ? "text-green-400" : "text-red-400"}`}>
                {getPaymentStatusText(orderData.paymentStatus)}
              </span>
            </div>
            {orderData.note && (
              <div className="pt-2 border-t border-brand-border/40 mt-2">
                <span className="text-brand-subdued text-xs block">Ghi chú từ khách hàng:</span>
                <p className="text-xs text-brand-cream italic mt-0.5">{orderData.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items List Table */}
      <div className="border border-brand-border rounded-lg overflow-hidden">
        <div className="bg-brand-muted/30 px-5 py-3 border-b border-brand-border">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Sản phẩm đã đặt ({itemsList.length})
          </h3>
        </div>
        <div className="divide-y divide-brand-border/60">
          {itemsList.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 hover:bg-brand-muted/10 transition-colors">
              <div className="w-16 h-16 rounded overflow-hidden bg-brand-muted shrink-0 flex items-center justify-center">
                {item.productImage ? (
                  <CloudinaryImage
                    publicId={item.productImage}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">🎒</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/san-pham/${item.productSlug}`}
                  className="font-display font-bold text-white text-sm hover:text-brand-gold transition-colors block truncate"
                >
                  {item.productName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  {item.color && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-body text-brand-subdued">
                      Màu:
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: item.colorHex || "#888" }}
                      />
                      {item.color}
                    </span>
                  )}
                  <span className="text-[11px] font-body text-brand-subdued">•</span>
                  <span className="text-[11px] font-body text-brand-subdued">
                    Số lượng: {item.quantity}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-body text-sm font-semibold text-white">
                  {formatPrice(item.price)}
                </p>
                <p className="font-body text-xs text-brand-subdued mt-0.5">
                  Thành tiền: {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="flex flex-col items-end border-t border-brand-border pt-6 space-y-2 text-sm font-body">
        <div className="flex justify-between w-full max-w-xs text-brand-subdued">
          <span>Tiền hàng:</span>
          <span className="text-white font-medium">{formatPrice(orderData.subtotal)}</span>
        </div>
        <div className="flex justify-between w-full max-w-xs text-brand-subdued">
          <span>Phí vận chuyển:</span>
          <span className="text-white font-medium">{formatPrice(orderData.shippingFee)}</span>
        </div>
        {orderData.discount > 0 && (
          <div className="flex justify-between w-full max-w-xs text-red-400">
            <span>Giảm giá:</span>
            <span>-{formatPrice(orderData.discount)}</span>
          </div>
        )}
        <div className="flex justify-between w-full max-w-xs text-base font-bold border-t border-brand-border/40 pt-2 mt-2">
          <span className="text-white font-display uppercase tracking-wider">Tổng thanh toán:</span>
          <span className="text-brand-gold">{formatPrice(orderData.total)}</span>
        </div>
      </div>

      {/* Interactive Actions for pending/shipping order */}
      <div className="pt-4 border-t border-brand-border flex justify-end">
        <OrderActions orderId={orderData.id} initialStatus={orderData.status} />
      </div>
    </div>
  );
}
