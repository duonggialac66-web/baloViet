import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PromotionForm from "@/components/admin/PromotionForm";

export const metadata = {
  title: "Thêm Ưu đãi & Banner Mới - Admin",
};

export default async function CreatePromotionPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/uu-dai/tao-moi");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thêm Chương trình Ưu đãi & Banner Mới</h1>
        <p className="text-gray-500 mt-2">
          Tạo mới ưu đãi hoặc banner chiến dịch khuyến mãi để hiển thị trực tiếp lên Hero Carousel trang chủ.
        </p>
      </div>

      <PromotionForm />
    </div>
  );
}
