import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
export const metadata = {
  title: "Admin Dashboard - Balo Việt",
  description: "Quản trị hệ thống Balo Việt",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  // Route protection
  if (!user) {
    redirect("/dang-nhap?redirect=/admin");
  }

  if (user.role !== "admin") {
    redirect("/"); // Or a generic unauthorized page
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 p-8 overflow-y-auto animate-fadeup" style={{ animationDelay: '150ms' }}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
