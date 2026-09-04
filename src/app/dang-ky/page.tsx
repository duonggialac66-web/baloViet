import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản – Balo Việt",
  description: "Tạo tài khoản Balo Việt mới để lưu trữ lịch sử mua hàng, địa chỉ giao hàng và nhận nhiều ưu đãi độc quyền",
};

export default async function RegisterPage() {
  const { user } = await getSession();

  // If already logged in, redirect to account dashboard
  if (user) {
    redirect("/tai-khoan");
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0B0D0E] flex items-center justify-center px-4">
      <RegisterForm />
    </main>
  );
}
