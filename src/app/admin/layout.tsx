import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

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
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
