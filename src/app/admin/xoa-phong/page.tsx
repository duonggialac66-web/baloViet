import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import BackgroundRemoverStudio from "@/components/admin/BackgroundRemoverStudio";

export const metadata = {
  title: "Studio Xóa Phông & Tạo Ảnh PNG - Admin",
};

export default async function AdminBackgroundRemovalPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/xoa-phong");
  }

  return (
    <div className="space-y-6">
      <BackgroundRemoverStudio />
    </div>
  );
}
