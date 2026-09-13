import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc } from "drizzle-orm";
import DataTable from "@/components/admin/DataTable";
import { formatPrice } from "@/data/products";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Quản lý Sản phẩm - Admin",
};

export default async function AdminProductsPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/dang-nhap?redirect=/admin/san-pham");
  }

  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121417] p-6 rounded-2xl border border-[#22242B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-syne">Quản lý Sản phẩm</h1>
          <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 font-sans">Xem, thêm, sửa, xóa các sản phẩm trong hệ thống Balo Việt.</p>
        </div>
        <Link 
          href="/admin/san-pham/tao-moi" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5B800] text-black font-bold rounded-xl hover:bg-[#e0a800] transition-colors text-xs font-sans uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(245,184,0,0.25)]"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </Link>
      </div>

      <DataTable
        data={allProducts}
        keyExtractor={(item) => item.id}
        columns={[
          { 
            header: "Sản phẩm", 
            key: "name", 
            render: (item) => (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#181A1F] rounded-xl overflow-hidden border border-[#2A2C2F] shrink-0">
                  {item.imageIds && item.imageIds[0] ? (
                    <img src={item.imageIds[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">N/A</div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white max-w-[220px] truncate font-sans text-xs">{item.name}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">SKU: {item.sku}</p>
                </div>
              </div>
            ) 
          },
          { 
            header: "Danh mục", 
            key: "categorySlug",
            render: (item) => <span className="font-mono text-xs text-[#9CA3AF] uppercase">{item.categorySlug}</span>
          },
          { 
            header: "Giá bán", 
            key: "price", 
            render: (item) => <span className="font-bold text-[#F5B800] font-mono text-xs">{formatPrice(item.price)}</span> 
          },
          { 
            header: "Tồn kho", 
            key: "stock", 
            render: (item) => (
              <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md uppercase border ${
                item.stock > 10 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : item.stock > 0 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {item.stock} cái
              </span>
            )
          },
          {
            header: "Thao tác",
            key: "actions",
            render: (item) => (
              <div className="flex gap-2 items-center">
                <Link 
                  href={`/admin/san-pham/${item.id}`} 
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-[#F5B800]/40 text-[#F5B800] hover:bg-[#F5B800]/15 rounded-lg text-xs font-bold font-sans transition-colors"
                >
                  Sửa
                </Link>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
