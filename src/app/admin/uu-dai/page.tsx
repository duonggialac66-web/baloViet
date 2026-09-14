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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121417] p-6 rounded-2xl border border-[#22242B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">Quản lý Ưu đãi & Banner Hero</h1>
          <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 font-sans">
            Thiết lập các chương trình khuyến mãi, voucher và banner xuất hiện trên Hero Carousel trang chủ.
          </p>
        </div>
        <Link
          href="/admin/uu-dai/tao-moi"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5B800] text-black font-bold rounded-xl hover:bg-[#e0a800] transition-colors font-sans text-xs uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(245,184,0,0.25)]"
        >
          <Plus className="w-4 h-4" /> Thêm ưu đãi mới
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
              <div className="relative w-48 sm:w-56 h-28 bg-[#181A1F] rounded-xl overflow-hidden border border-[#2A2D35] shadow-md group shrink-0">
                {item.imageUrl ? (
                  <>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[10px] font-bold bg-[#F5B800] text-black px-2 py-0.5 rounded uppercase">
                        {item.badge || item.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">Chưa có background</div>
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
                  <span className="text-[10px] font-mono font-bold bg-[#181A1F] text-[#9CA3AF] px-2 py-0.5 rounded border border-[#2A2D35]">
                    {item.tag || "TAG DANH MỤC"}
                  </span>
                  {item.discountValue && (
                    <span className="text-[10px] font-mono font-bold text-[#F5B800] bg-[#F5B800]/15 px-2 py-0.5 rounded border border-[#F5B800]/30">
                      {item.discountValue}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-[#9CA3AF] line-clamp-2">{item.description}</p>
                {item.code && (
                  <p className="text-[11px] font-mono text-[#9CA3AF]">Mã: <strong className="text-[#F5B800]">{item.code}</strong></p>
                )}
              </div>
            ),
          },
          {
            header: "Thứ tự",
            key: "sortOrder",
            render: (item) => (
              <span className="font-mono text-xs font-bold bg-[#181A1F] text-[#F5B800] px-2.5 py-1 rounded-md border border-[#2A2D35]">
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
                  className="px-3 py-1.5 border border-[#F5B800]/40 text-[#F5B800] hover:bg-[#F5B800]/15 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
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
