import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserSidebar from "@/components/auth/UserSidebar";

interface Props {
  children: React.ReactNode;
}

export default async function TaiKhoanLayout({ children }: Props) {
  const { user } = await getSession();

  if (!user) {
    redirect("/dang-nhap?redirect=/tai-khoan");
  }

  return (
    <main className="min-h-screen pt-28 pb-20 bg-brand-black">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <UserSidebar user={user} />
          <div className="flex-1 bg-brand-card border border-brand-border rounded-lg p-6 lg:p-8 min-h-[500px]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
