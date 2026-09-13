export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: "Mẹo Balo & Du lịch" | "Chăm sóc & Bảo quản" | "Xu hướng & Phong cách" | "Tin tức thương hiệu";
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readingTime: string;
  tags: string[];
  isFeatured?: boolean;
  views?: number;
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-001",
    title: "Cách Chọn Balo Laptop Cho Dân Lập Trình & Đồ Họa Hợp Chuẩn 2026",
    slug: "cach-chon-balo-laptop-cho-dan-lap-trinh-do-hoa",
    category: "Mẹo Balo & Du lịch",
    excerpt: "Hướng dẫn chi tiết chọn balo vừa vặn laptop 15.6 - 17.3 inch, tích hợp đệm chống sóc 360°, kháng nước mưa và đệm lưng giảm mỏi vai.",
    coverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80",
    author: {
      name: "Trần Minh Đức",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chuyên gia Balo & Ergonomics"
    },
    publishedAt: "2026-09-10",
    readingTime: "5 phút đọc",
    tags: ["Balo Laptop", "Kinh nghiệm chọn balo", "Chống sóc", "Ergonomic"],
    isFeatured: true,
    views: 1250,
    content: `
### 1. Kích thước ngăn chứa vừa vặn khung máy
Khi chọn balo cho laptop làm việc (đặc biệt là các dòng máy trạm Workstation hoặc laptop Gaming 15.6" đến 17.3"), điều quan trọng đầu tiên là kích thước ngăn chứa. Ngăn laptop không nên quá rộng làm máy bị xốc xệch, cũng không nên quá chật gây cạ góc cạnh.

> **Lời khuyên:** Nên chọn balo có thêm dây đai nẹp cố định bằng Velcro cao cấp để giữ chắc máy khi di chuyển xe máy trên đường gập ghềnh.

### 2. Chất liệu chống thấm nước bảo vệ linh kiện
Vải **Kodura 1000D** hoặc **Polyester tráng PU/TPU** là hai chất liệu lý tưởng. Khi di chuyển dưới cơn mưa bất chợt tại Việt Nam, các đường may chống nước cùng khóa kéo dạ quang sẽ giúp nước mưa không thấm qua lớp vải lót vào bo mạch điện tử.

### 3. Đệm lưng thoáng khí & Dai trợ lực vai
Một chiếc balo chứa laptop 2.5kg + sạc + tài liệu thường nặng từ 4kg - 5kg. Hệ thống đệm lưng **Airflow Matrix** tổ ong kết hợp đệm vai dày 1.5cm giúp phân bổ trọng lực đều sang hai vai, giảm áp lực lên đốt sống cổ hiệu quả đến 40%.
    `
  },
  {
    id: "blog-002",
    title: "Hướng Dẫn Vệ Sinh & Bảo Quản Balo Đúng Cách Không Mất Phom",
    slug: "huong-dan-ve-sinh-bao-quan-balo-dung-cach",
    category: "Chăm sóc & Bảo quản",
    excerpt: "Bí quyết giặt balo chống nước bằng tay, làm sạch vệt bẩn dai dẳng và sấy khô an toàn giúp kéo dài tuổi thọ balo lên tới 5 năm.",
    coverImage: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=1000&auto=format&fit=crop&q=80",
    author: {
      name: "Nguyễn Hà Phương",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      role: "QC Manager - Balo Việt"
    },
    publishedAt: "2026-09-05",
    readingTime: "4 phút đọc",
    tags: ["Mẹo bảo quản", "Vệ sinh balo", "Độ bền"],
    isFeatured: false,
    views: 890,
    content: `
### Nguyên tắc vàng: Không giặt balo bằng máy giặt!
Lực quay vắt của máy giặt có thể làm hỏng khung đệm lưng, đứt chỉ may và bong tróc lớp màng chống nước TPU phủ bên trong balo.

#### Các bước vệ sinh balo chuẩn 4 bước:
1. **Làm sạch rác & bụi mịn trong ngăn chứa:** Dùng máy hút bụi cầm tay hút sạch góc ngách.
2. **Ngâm dung dịch xà phòng dịu nhẹ:** Pha loãng dầu gội hoặc xà phòng trung tính với nước ấm 30°C.
3. **Dùng chải lông mềm lau vệt bẩn:** Chải nhẹ nhàng các vệt bẩn trên bề mặt vải, tránh dùng chải sắt hay hóa chất tẩy rửa mạnh.
4. **Phơi khô nơi thoáng gió:** Lộn ngược balo và phơi ở nơi bóng râm, tránh ánh nắng mặt trời trực tiếp gay gắt làm phai màu vải.
    `
  },
  {
    id: "blog-003",
    title: "Balo Du Lịch 40L - Người Bạn Đồng Hành Hoàn Hảo Cho Chuyến Đi 5 Ngày",
    slug: "balo-du-lich-40l-dong-hanh-chuyen-di-5-ngay",
    category: "Xu hướng & Phong cách",
    excerpt: "Khám phá cách sắp xếp hành lý thông minh vào balo 40L thay thế hoàn toàn vali cồng kềnh khi đi du lịch hoặc trekking.",
    coverImage: "https://images.unsplash.com/photo-1622260614927-208cfe3f5cfd?w=1000&auto=format&fit=crop&q=80",
    author: {
      name: "Lê Hoàng Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "Blogger Du lịch & Khám phá"
    },
    publishedAt: "2026-08-28",
    readingTime: "6 phút đọc",
    tags: ["Balo Du lịch", "Trekking", "Mẹo xếp đồ"],
    isFeatured: false,
    views: 1420,
    content: `
### Tại sao nên chọn Balo 40L thay vì Vali kéo?
Balo du lịch 40L đạt kích thước xách tay chuẩn của mọi hãng hàng không (Vietjet, Vietnam Airlines, Bamboo). Bạn không phải mất thời gian đợi lấy hành lý ký gửi và dễ dàng di chuyển trên địa hình gồ ghề.

### Công thức xếp đồ 5-4-3-2-1 thông minh:
- **5 bộ quần áo mỏng nhẹ:** Cuộn tròn giúp tiết kiệm diện tích và chống nhăn.
- **4 đôi tất & đồ lót:** Nhét vào bên trong giày để giữ phom giày.
- **3 phụ kiện điện tử:** Pin dự phòng, dây sạc, máy ảnh đựng riêng túi chống nước.
- **2 đôi giày:** 1 đôi đang mang + 1 đôi sandal/thể thao dự phòng.
- **1 túi đồ vệ sinh cá nhân nhỏ gọn.**
    `
  },
  {
    id: "blog-004",
    title: "Balo Việt Ra Mắt BST Mới 2026: Đột Phá Công Nghệ Chống Nước IPX6",
    slug: "balo-viet-ra-mat-bst-moi-2026-chong-nuoc-ipx6",
    category: "Tin tức thương hiệu",
    excerpt: "Dòng sản phẩm balo mới tích hợp vải tráng TPU Nano và đường khóa kéo ép nhiệt giúp kháng nước tuyệt đối dưới mưa bão.",
    coverImage: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=1000&auto=format&fit=crop&q=80",
    author: {
      name: "Ban Biên Tập Balo Việt",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Official Newsroom"
    },
    publishedAt: "2026-08-20",
    readingTime: "3 phút đọc",
    tags: ["Tin tức", "Balo Việt", "Công nghệ IPX6"],
    isFeatured: false,
    views: 2100,
    content: `
Balo Việt chính thức ra mắt bộ sưu tập sản phẩm mới 2026 ứng dụng tiêu chuẩn kháng nước **IPX6**. Đây là kết quả nghiên cứu và phát triển trong 18 tháng nhằm giải quyết nỗi lo ngập nước & mưa rào bất chợt của người dùng tại các đô thị Việt Nam.

#### Điểm cải tiến công nghệ nổi bật:
- **Vải ép màng Nano TPU 3 lớp:** Chống trầy xước, chống bám bụi và chống thấm nước hoàn hảo.
- **Đường khóa kéo Seamless Zipper:** Khóa kéo được bọc màng cao su chống tràn nước qua khe răng khóa.
- **Phản quang dạ quang 360°:** An toàn tối đa khi di chuyển ban đêm.
    `
  }
];
