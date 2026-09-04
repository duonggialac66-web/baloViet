import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import OrderDetailsClient from "./OrderDetailsClient";

export const metadata = {
  title: "Chi tiết đơn hàng - Admin",
};

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/don-hang");
  }

  const { id } = await params;

  // Fetch order
  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (orderResult.length === 0) {
    notFound();
  }

  const order = orderResult[0];

  // Fetch items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <OrderDetailsClient initialOrder={order} items={items} />
    </div>
  );
}
