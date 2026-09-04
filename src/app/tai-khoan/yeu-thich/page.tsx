import type { Metadata } from "next";
import WishlistManager from "@/components/auth/WishlistManager";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích – Balo Việt",
  description: "Danh sách sản phẩm balo yêu thích của bạn tại Balo Việt",
};

export default function YeuThichPage() {
  return <WishlistManager />;
}
