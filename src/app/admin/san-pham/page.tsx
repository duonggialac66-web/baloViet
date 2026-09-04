import HeroToggle from "@/components/admin/HeroToggle";
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 mt-2">Xem, thêm, sửa, xóa các sản phẩm trong hệ thống.</p>
        </div>
        <Link 
          href="/admin/san-pham/tao-moi" 
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" /> Thêm sản phẩm
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
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden border border-gray-200">
                  {item.imageIds && item.imageIds[0] ? (
                    <img src={item.imageIds[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">N/A</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 max-w-[200px] truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                </div>
              </div>
            ) 
          },
          { header: "Danh mục", key: "categorySlug" },
          { header: "Giá", key: "price", render: (item) => <span className="font-medium text-gray-900">{formatPrice(item.price)}</span> },
          { header: "Tồn kho", key: "stock", render: (item) => (
             <span className={`px-2 py-1 text-xs rounded-full ${item.stock > 10 ? 'bg-green-100 text-green-800' : item.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
               {item.stock}
             </span>
          )},
          {
            header: "Thao tác",
            key: "actions",
            render: (item) => (
              <div className="flex gap-2 items-center">
                <HeroToggle productId={item.id} initialIsFeatured={item.isHeroFeatured || false} />
                <Link 
                  href={`/admin/san-pham/${item.id}`} 
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-amber-600 text-amber-600 hover:bg-amber-50 rounded-md text-sm font-medium transition-colors"
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
