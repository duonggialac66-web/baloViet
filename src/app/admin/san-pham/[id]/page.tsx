import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import ProductEditClient from "./ProductEditClient";

export const metadata = {
  title: "Sửa Sản phẩm - Admin",
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/san-pham");
  }

  const { id } = await params;

  const productResult = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (productResult.length === 0) {
    notFound();
  }

  return <ProductEditClient product={productResult[0]} />;
}
