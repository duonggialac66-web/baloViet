import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotions } from "@/lib/schema";
import { asc, desc } from "drizzle-orm";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Edit2 } from "lucide-react";
import PromotionToggle from "@/components/admin/PromotionToggle";
import PromotionDeleteButton from "@/components/admin/PromotionDeleteButton";

export const metadata = {
  title: "Quản lý Ưu đãi & Banner Hero - Admin",
};

export default async function AdminPromotionsPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/uu-dai");
  }

  const allPromos = await db
    .select()
    .from(promotions)
    .orderBy(asc(promotions.sortOrder), desc(promotions.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Ưu đãi & Banner Hero</h1>
          <p className="text-gray-500 mt-2">
            Thiết lập các chương trình khuyến mãi, voucher và banner xuất hiện trên Hero Carousel trang chủ.
          </p>
        </div>
        <Link
          href="/admin/uu-dai/tao-moi"
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" /> Thêm ưu đãi mới
        </Link>
      </div>

      <DataTable
        data={allPromos}
        keyExtractor={(item) => item.id}
        emptyMessage="Chưa có chương trình ưu đãi nào. Hãy tạo chương trình đầu tiên!"
        columns={[
          {
            header: "Hình nền Hero Background",
            key: "imageUrl",
            render: (item) => (
              <div className="relative w-48 sm:w-56 h-28 bg-gray-950 rounded-xl overflow-hidden border border-gray-700 shadow-md group shrink-0">
                {item.imageUrl ? (
                  <>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[10px] font-bold bg-[#FFB800] text-black px-2 py-0.5 rounded uppercase">
                        {item.badge || item.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Chưa có background</div>
                )}
              </div>
            ),
          },
          {
            header: "Nội dung & Ưu đãi",
            key: "title",
            render: (item) => (
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                    {item.tag || "TAG BỘ SƯU TẬP"}
                  </span>
                  {item.discountValue && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {item.discountValue}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                {item.code && (
                  <p className="text-xs font-mono text-gray-600">Mã: <strong className="text-gray-900">{item.code}</strong></p>
                )}
              </div>
            ),
          },
          {
            header: "Thứ tự",
            key: "sortOrder",
            render: (item) => (
              <span className="font-mono text-sm font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                #{item.sortOrder || 0}
              </span>
            ),
          },
          {
            header: "Hiển thị trên Hero",
            key: "isActive",
            render: (item) => (
              <PromotionToggle id={item.id} initialActive={Boolean(item.isActive)} />
            ),
          },
          {
            header: "Thao tác",
            key: "actions",
            render: (item) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/uu-dai/${item.id}`}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs rounded-md transition-colors flex items-center gap-1"
                  title="Chỉnh sửa background và ưu đãi"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa
                </Link>
                <PromotionDeleteButton id={item.id} title={item.title} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
