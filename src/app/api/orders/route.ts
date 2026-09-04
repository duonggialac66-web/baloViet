import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSession();
    const body = await req.json();
    const { items, shippingAddress, customerEmail, customerPhone, customerName, paymentMethod, note } = body;

    if (!items || items.length === 0 || !shippingAddress || !customerPhone || !customerName) {
      return NextResponse.json({ error: "Thông tin đơn hàng không đầy đủ" }, { status: 400 });
    }

    // 1. Calculate totals & verify stock
    let subtotal = 0;
    const itemsToInsert: any[] = [];

    // Begin verification loop
    for (const item of items) {
      // Fetch product to verify price & stock
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ error: `Sản phẩm ${item.productName} không tồn tại` }, { status: 404 });
      }

      const dbProduct = result[0];

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Sản phẩm ${dbProduct.name} không đủ hàng tồn kho (Còn lại: ${dbProduct.stock})` },
          { status: 400 }
        );
      }

      const itemPrice = dbProduct.salePrice ?? dbProduct.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      itemsToInsert.push({
        id: nanoid(),
        productId: item.productId,
        productName: dbProduct.name,
        productImage: dbProduct.imageIds && dbProduct.imageIds.length > 0 ? dbProduct.imageIds[0] : null,
        productSlug: dbProduct.slug,
        color: item.color,
        colorHex: item.colorHex,
        price: itemPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Shipping fee rules
    const shippingFee = subtotal >= 1000000 ? 0 : 30000;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const orderId = nanoid();
    // Generate order number like ORD-20260827-XYZ1
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = nanoid(4).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    // 2. Perform DB Updates (transacting order creation & stock reduction)
    await db.transaction(async (tx) => {
      // Create Order
      await tx.insert(orders).values({
        id: orderId,
        orderNumber,
        userId: user ? user.id : null,
        customerName,
        customerEmail: user ? user.email : customerEmail,
        customerPhone,
        shippingAddress,
        subtotal,
        shippingFee,
        discount,
        total,
        status: "pending",
        paymentMethod,
        paymentStatus: "unpaid",
        note: note ? note.trim() : null,
      });

      // Create Order Items
      for (const item of itemsToInsert) {
        await tx.insert(orderItems).values({
          ...item,
          orderId,
        });

        // Reduce stock
        await tx
          .update(products)
          .set({
            stock: sql`stock - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống khi tạo đơn hàng" }, { status: 500 });
  }
}
