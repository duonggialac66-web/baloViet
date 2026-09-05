"use client";

import ScrollReveal from "@/components/ScrollReveal";

export interface BrandGuaranteeConfig {
  announcementTitle?: string;
  announcementSubtitle?: string;
  card1Title?: string;
  card1Desc?: string;
  card2Title?: string;
  card2Desc?: string;
  brandTitle?: string;
  brandIntro?: string;
  reasonsTitle?: string;
  reasons?: string[];
}

export const DEFAULT_HOME_POLICY: Required<BrandGuaranteeConfig> = {
  announcementTitle: "BẢO HÀNH 365 NGÀY - HƯ SỬA - LỖI ĐỔI",
  announcementSubtitle: "Bán hàng bằng uy tín. Bạn cứ việc trải nghiệm, hậu mãi cứ để Balo Việt lo.",
  card1Title: "14 NGÀY ĐỔI TRẢ",
  card1Desc: "Hỗ trợ đổi sản phẩm trong vòng 14 ngày (09:00 - 22:00). Điều kiện: Còn tem mác, chưa qua sử dụng, có hóa đơn.",
  card2Title: "BẢO HÀNH 365 NGÀY",
  card2Desc: "Bảo hành 1 năm cho lỗi kỹ thuật. Bảo hành điện tử trên hệ thống tại bất kỳ cửa hàng nào. KHÔNG CẦN HOÁ ĐƠN",
  brandTitle: "BALO VIỆT – ĐỒNG HÀNH TRÊN MỌI HÀNH TRÌNH | THƯƠNG HIỆU BALO CAO CẤP VIỆT NAM",
  brandIntro: "Balo Việt là thương hiệu balo & phụ kiện du lịch cao cấp tại Việt Nam với triết lý \"Bền Bỉ – Tiện Nghi – Chuẩn Công Thái Học\". Hơn 8 năm phát triển, chúng tôi tập trung mang đến những sản phẩm chất lượng chuẩn quốc tế, bảo vệ cột sống và đồng hành cùng người Việt trên mọi nẻo đường.",
  reasonsTitle: "Tại sao nên chọn Balo Việt?",
  reasons: [
    "- Bền Bỉ: Vải Cordura 1000D & TPU chống thấm nước tuyệt đối, khóa kéo YKK êm ái, tuổi thọ trên 5 năm.",
    "- Êm Ái: Quai đeo công thái học Ergonomic giảm 30% áp lực cột sống, đệm lưng thoáng khí AirFlow 3D.",
    "- Thông Minh: Ngăn chống sốc laptop 360°, cổng sạc USB-C chống nước và nhiều ngăn chức năng độc lập."
  ]
};

interface BrandGuaranteeSectionProps {
  initialData?: BrandGuaranteeConfig;
}

export default function BrandGuaranteeSection({ initialData }: BrandGuaranteeSectionProps) {
  const data = {
    ...DEFAULT_HOME_POLICY,
    ...initialData,
  };

  return (
    <section className="bg-[#F8F9FA] text-[#0B0D0E]">
      {/* ========================================================= */}
      {/* 1. TOP BLACK ANNOUNCEMENT BANNER                          */}
      {/* ========================================================= */}
      <div className="bg-[#0B0D0E] text-center py-6 sm:py-8 px-4 border-t border-b border-[#2A2C2F]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-black text-white text-xl sm:text-2xl lg:text-3xl uppercase tracking-wider drop-shadow-sm">
            {data.announcementTitle}
          </h2>
          <p className="text-[#F5B800] font-medium text-xs sm:text-sm mt-1.5 tracking-wide">
            {data.announcementSubtitle}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TWO FLOATING WHITE GUARANTEE CARDS                      */}
      {/* ========================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: 14 Ngày Đổi Trả */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300 h-full">
              <h3 className="font-display font-black text-[#1E2022] text-2xl sm:text-3xl uppercase tracking-tight mb-4">
                {data.card1Title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-sm">
                {data.card1Desc}
              </p>
            </div>
          </ScrollReveal>

          {/* Card 2: Bảo Hành 365 Ngày */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300 h-full">
              <h3 className="font-display font-black text-[#1E2022] text-2xl sm:text-3xl uppercase tracking-tight mb-4">
                {data.card2Title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-sm">
                {data.card2Desc}
              </p>
            </div>
          </ScrollReveal>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BRAND STORY & SEO CONTENT BLOCK                        */}
      {/* ========================================================= */}
      <div className="bg-white border-t border-gray-200/80 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h3 className="font-display font-bold text-[#1E2022] text-base sm:text-lg lg:text-xl uppercase tracking-wide mb-5">
              {data.brandTitle}
            </h3>

            <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed mb-6">
              {data.brandIntro}
            </p>

            {data.reasons && data.reasons.length > 0 && (
              <div className="pt-2">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3">
                  {data.reasonsTitle}
                </h4>
                <ul className="space-y-2 text-gray-600 text-sm sm:text-[15px] leading-relaxed">
                  {data.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
