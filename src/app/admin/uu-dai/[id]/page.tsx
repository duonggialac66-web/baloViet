import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import PromotionForm from "@/components/admin/PromotionForm";

export const metadata = {
  title: "Chỉnh sửa Ưu đãi - Admin",
};

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/uu-dai");
  }

  const { id } = await params;
  const promoList = await db
    .select()
    .from(promotions)
    .where(eq(promotions.id, id))
    .limit(1);

  if (promoList.length === 0) {
    notFound();
  }

  const promo = promoList[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Chương trình Ưu đãi</h1>
        <p className="text-gray-500 mt-2">
          Cập nhật thông tin chi tiết, banner hoặc trạng thái hiển thị của ưu đãi &quot;{promo.title}&quot;.
        </p>
      </div>

      <PromotionForm initialData={promo} isEdit={true} />
    </div>
  );
}
