import type { Metadata } from "next";
import AddressManager from "@/components/auth/AddressManager";

export const metadata: Metadata = {
  title: "Sổ địa chỉ – Balo Việt",
  description: "Quản lý địa chỉ giao hàng mặc định của bạn tại Balo Việt",
};

export default function DiaChiPage() {
  return <AddressManager />;
}
