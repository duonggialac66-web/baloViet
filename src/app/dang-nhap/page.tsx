import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập – Balo Việt",
  description: "Đăng nhập tài khoản Balo Việt để quản lý đơn hàng và nhận ưu đãi",
};

interface SearchParams {
  redirect?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { user } = await getSession();
  
  // If already logged in, redirect to target or account page
  if (user) {
    const resolvedParams = await searchParams;
    const dest = resolvedParams.redirect || "/tai-khoan";
    redirect(dest);
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E] flex items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
