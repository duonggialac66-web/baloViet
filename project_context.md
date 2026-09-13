# Project Context – Balo Việt E-Commerce Platform

Tài liệu này cung cấp bức tranh toàn cảnh, chi tiết về mặt cấu trúc, kiến trúc công nghệ, hệ thống database, danh sách API, luồng nghiệp vụ và quy ước lập trình của dự án **Balo Việt**. 

> **Mục đích**: Cung cấp ngữ cảnh đầy đủ cho AI Assistant và lập trình viên trong các phiên làm việc tiếp theo, giúp nắm bắt ngay toàn bộ codebase mà không cần phải quét hoặc đọc lại từng file từ đầu.

---

## 1. Tổng quan Dự án (Project Overview)

- **Tên thương hiệu**: **Balo Việt** (`https://baloviet.vn`)
- **Khẩu hiệu**: *"Đồng hành trên mọi hành trình"*
- **Mục tiêu sản phẩm**: Nền tảng thương mại điện tử chuyên cung cấp các dòng balo cao cấp chính hãng Việt Nam (Balo laptop chống sốc, Balo du lịch trekking, Balo học sinh/sinh viên, Balo thời trang đô thị, Balo chống nước chuyên dụng IPX6).
- **Ngôn ngữ người dùng**: Giao diện & tên route tiếng Việt (`/san-pham`, `/gio-hang`, `/thanh-toan`, `/tai-khoan`, `/admin`,...).
- **Ngôn ngữ mã nguồn**: Tên biến, hàm, component, bảng database và API logic sử dụng tiếng Anh chuẩn mực.
- **Phong cách thiết kế (UI Design System)**: Lấy cảm hứng từ phong cách **PackX** hiện đại, tone màu Dark Mode sang trọng (`#0B0D0E`), điểm nhấn màu vàng gold (`#F5B800`), font chữ hiển thị nổi bật **Barlow Condensed** kết hợp cùng typography đọc **Inter**.

---

## 2. Tech Stack & Kiến trúc Kỹ thuật (Technical Stack)

| Hạng mục | Công nghệ & Thư viện | Ghi chú & Vai trò |
|---|---|---|
| **Core Framework** | **Next.js 15 (App Router)** | Kiến trúc Server Components mặc định, Server Actions & Route Handlers. Lưu ý Next.js 15: `params` trong Page/Route Handler là `Promise`. |
| **Giao diện & Ngôn ngữ** | **React 19**, **TypeScript 5.7** | React Server Components (RSC) kết hợp Client Components (`"use client"`). |
| **Styling** | **Tailwind CSS v4** (`@tailwindcss/postcss`) | Sử dụng chỉ thị `@theme` trong `src/app/globals.css` để định nghĩa biến màu sắc và font chữ. Không dùng file `tailwind.config.js` cũ. |
| **Database** | **Neon Database** (Serverless PostgreSQL) | Kết nối thông qua `@neondatabase/serverless` trên kiến trúc HTTP không trạng thái (stateless / connection pooling). |
| **ORM & Migrations** | **Drizzle ORM** + **Drizzle Kit** | Tương tác DB Type-safe với `drizzle-orm/neon-http`. File cấu hình: `drizzle.config.ts`, schema tập trung tại `src/lib/schema.ts`. |
| **Xác thực & Bảo mật** | **Cookie Session Tự dựng (Custom Session)** | Sử dụng `bcryptjs` (salt 10 rounds) hash mật khẩu, `nanoid` (32 ký tự) sinh session ID, lưu bảng `sessions` (TTL 30 ngày, tự động gia hạn khi dùng quá 50% thời hạn), cookie HTTP-Only `baloviet_session`. |
| **Điều hướng & Bảo vệ** | **Next.js Middleware** (`src/middleware.ts`) | Kiểm tra cookie session để chuyển hướng người dùng khi truy cập vùng bảo vệ (`/tai-khoan/*`, `/admin/*`). |
| **Quản lý State** | **React Context API** | `CartProvider` (quản lý giỏ hàng + drawer, lưu `localStorage`), `AuthProvider` (quản lý thông tin đăng nhập client-side), `ToastProvider` (thông báo popup). |
| **Iconography** | **Lucide React** | Hệ thống icon tối giản, đồng bộ. |
| **Xử lý Hình ảnh & CDN** | **Cloudinary** (`@cloudinary/url-gen`) | Tự động sinh URL tối ưu ảnh, responsive srcset, định dạng WebP/AVIF. |
| **Công cụ AI Xóa phông** | **@imgly/background-removal** | Xóa nền ảnh sản phẩm client-side bằng WebAssembly (WASM), xuất transparent PNG phục vụ banner & catalog mà không tốn chi phí API server. |
| **AI Roadmap** | **Google Gemini AI** | Sẵn sàng API key trong `.env` phục vụ Semantic Search & Vector Embeddings. |

---

## 3. Cấu trúc Thư mục Toàn diện (Directory Tree)

```text
baloViet-main/
├── .env                                  # Cấu hình biến môi trường (DATABASE_URL, CLOUDINARY, GEMINI)
├── drizzle.config.ts                     # Cấu hình Drizzle Kit CLI
├── next.config.ts                        # Cấu hình Next.js (domains, remote image patterns)
├── package.json                          # Dependencies & npm scripts
├── postcss.config.mjs                    # PostCSS cấu hình cho Tailwind CSS v4
├── tsconfig.json                         # Cấu hình TypeScript compiler & alias path "@/*"
├── project_context.md                    # [FILE NÀY] Tài liệu tổng quan dự án
│
├── drizzle/                              # Quản lý Database Migrations
│   ├── 0000_minor_slayback.sql           # File migration SQL khởi tạo
│   └── meta/                             # Drizzle metadata snapshot
│
├── plan/                                 # Kế hoạch & tài liệu kiến trúc phát triển
│   ├── 01-upgrade-toan-dien.md           # Kế hoạch nâng cấp tổng thể
│   ├── 02-progress.md                    # Nhật ký tiến độ hoàn thành các phase
│   ├── 02-tai-khoan-user-admin.md        # Thiết kế hệ thống User & Admin
│   └── UI_header.md                      # Đặc tả UI/UX Header
│
├── public/                               # Static assets (images, icons, logos, hero-backpack.png)
│
├── scripts/                              # Kịch bản khởi tạo dữ liệu và DB Seeding
│   ├── init-promotions.ts                # Khởi tạo bảng và 4 banner khuyến mãi mẫu
│   ├── migrate-all-data.ts               # Seed 25+ sản phẩm, 5 danh mục, UI configs & admin
│   └── seed-admin.ts                     # Tạo nhanh tài khoản admin (admin@baloviet.vn / Admin@2026)
│
└── src/
    ├── middleware.ts                     # Route Guard: bảo vệ /tai-khoan và /admin, chặn khách chưa login
    ├── app/                              # Next.js App Router (Routes, Pages & API Endpoints)
    │   ├── layout.tsx                    # Root layout (Metadata, Google Fonts, Cart/Auth/Toast Providers)
    │   ├── page.tsx                      # Trang chủ (Hero Promo, Featured Products, 3D Slider, Guarantees)
    │   ├── globals.css                   # Global styles, Tailwind v4 @theme, keyframes & animations
    │   ├── robots.ts                     # Cấu hình robots.txt tự động
    │   ├── sitemap.ts                    # Cấu hình sitemap.xml động
    │   │
    │   ├── san-pham/                     # Danh sách sản phẩm & Chi tiết
    │   │   ├── page.tsx                  # Trang danh sách tất cả sản phẩm
    │   │   └── [slug]/page.tsx           # Trang chi tiết sản phẩm (SSR/SSG + SEO JSON-LD + Reviews)
    │   ├── danh-muc/[slug]/page.tsx      # Trang sản phẩm lọc theo danh mục
    │   ├── bo-suu-tap/page.tsx           # Trang bộ sưu tập sản phẩm
    │   ├── gio-hang/page.tsx             # Trang giỏ hàng đầy đủ
    │   ├── thanh-toan/page.tsx           # Trang thanh toán (Checkout Client, chọn địa chỉ, COD/Bank)
    │   ├── dat-hang-thanh-cong/page.tsx  # Trang cảm ơn sau khi hoàn tất đặt hàng
    │   ├── dang-nhap/page.tsx            # Trang đăng nhập tài khoản
    │   ├── dang-ky/page.tsx              # Trang đăng ký tài khoản
    │   ├── ve-chung-toi/page.tsx         # Giới thiệu câu chuyện thương hiệu
    │   ├── lien-he/page.tsx              # Thông tin liên hệ & form gửi tin
    │   ├── blog/page.tsx                 # Trang tin tức / bài viết kiến thức
    │   │
    │   ├── tai-khoan/                    # Khu vực người dùng (User Dashboard - Cần Auth)
    │   │   ├── layout.tsx                # Layout dashboard có UserSidebar
    │   │   ├── page.tsx                  # Tổng quan tài khoản & thông tin cá nhân
    │   │   ├── don-hang/                 # Lịch sử đơn hàng
    │   │   │   ├── page.tsx              # Danh sách các đơn đã đặt
    │   │   │   └── [id]/page.tsx         # Chi tiết từng đơn hàng, danh sách món, trạng thái
    │   │   ├── dia-chi/page.tsx          # Quản lý sổ địa chỉ giao hàng (CRUD, đặt mặc định)
    │   │   ├── yeu-thich/page.tsx        # Danh sách sản phẩm yêu thích (Wishlist)
    │   │   └── doi-mat-khau/page.tsx     # Đổi mật khẩu tài khoản
    │   │
    │   ├── admin/                        # Khu vực quản trị (Admin Dashboard - Cần quyền Admin)
    │   │   ├── layout.tsx                # Admin layout (kiểm tra user.role === "admin", AdminShell)
    │   │   ├── page.tsx                  # Trang tổng quan thống kê (Doanh thu, Đơn hàng, Khách, Sản phẩm)
    │   │   ├── don-hang/                 # Quản lý đơn hàng
    │   │   │   ├── page.tsx              # Danh sách đơn, bộ lọc trạng thái
    │   │   │   └── [id]/page.tsx         # Chi tiết đơn, cập nhật trạng thái đơn & thanh toán, ghi chú
    │   │   ├── san-pham/                 # Quản lý sản phẩm
    │   │   │   ├── page.tsx              # Danh sách sản phẩm kho hàng
    │   │   │   ├── tao-moi/page.tsx      # Thêm mới sản phẩm + tích hợp xóa phông AI
    │   │   │   └── [id]/page.tsx         # Chỉnh sửa sản phẩm
    │   │   ├── uu-dai/                   # Quản lý ưu đãi & Banner Hero Carousel
    │   │   │   ├── page.tsx              # Danh sách các banner khuyến mãi
    │   │   │   ├── tao-moi/page.tsx      # Thêm mới ưu đãi
    │   │   │   └── [id]/page.tsx         # Chỉnh sửa ưu đãi
    │   │   ├── cam-ket/page.tsx          # Quản lý chính sách bảo hành, cam kết trang chủ (UI Config)
    │   │   ├── xoa-phong/page.tsx        # Studio xóa phông ảnh độc lập (WASM AI Background Remover)
    │   │   ├── khach-hang/               # Quản lý khách hàng
    │   │   │   ├── page.tsx              # Danh sách khách hàng, thống kê số đơn
    │   │   │   └── [id]/page.tsx         # Chi tiết khách hàng, lịch sử mua sắm, nút khóa/mở tài khoản
    │   │   ├── danh-muc/page.tsx         # Quản lý danh mục sản phẩm (CRUD inline)
    │   │   └── danh-gia/page.tsx         # Quản lý đánh giá sản phẩm (Duyệt/từ chối/xóa reviews)
    │   │
    │   └── api/                          # Hệ thống REST API (Next.js Route Handlers)
    │       ├── auth/                     # Xác thực
    │       │   ├── register/route.ts     # Đăng ký tài khoản
    │       │   ├── login/route.ts        # Đăng nhập
    │       │   ├── logout/route.ts       # Đăng xuất
    │       │   ├── me/route.ts           # Lấy phiên làm việc hiện tại
    │       │   └── change-password/route.ts # Đổi mật khẩu
    │       ├── orders/route.ts           # Tạo đơn hàng (transactional trừ kho stock)
    │       ├── reviews/route.ts          # Lấy đánh giá đã duyệt / gửi đánh giá mới
    │       ├── search/route.ts           # Tìm kiếm sản phẩm theo từ khóa
    │       ├── seed-admin/route.ts       # Endpoint khởi tạo tài khoản admin
    │       ├── user/                     # API dành cho người dùng
    │       │   ├── addresses/route.ts    # CRUD sổ địa chỉ
    │       │   ├── profile/route.ts      # Cập nhật thông tin profile
    │       │   └── wishlist/route.ts     # Thêm/xóa/lấy sản phẩm yêu thích
    │       └── admin/                    # API dành riêng cho quản trị viên
    │           ├── orders/route.ts & [id]/route.ts
    │           ├── products/route.ts & [id]/route.ts
    │           ├── customers/route.ts & [id]/route.ts
    │           ├── categories/route.ts & [id]/route.ts
    │           ├── promotions/route.ts & [id]/route.ts
    │           ├── reviews/route.ts & [id]/route.ts
    │           └── home-policy/route.ts
    │
    ├── components/                       # Thư viện React Components
    │   ├── Header.tsx                    # Thanh điều hướng chính (ẩn khi vào /admin, auth-aware)
    │   ├── Footer.tsx                    # Chân trang (ẩn khi vào /admin)
    │   ├── Breadcrumb.tsx                # Điều hướng phân cấp Breadcrumb
    │   ├── ProductCard.tsx               # Card sản phẩm (Wishlist button, badge, giá sale, ratings)
    │   ├── CartDrawer.tsx                # Slide-over giỏ hàng tương tác nhanh
    │   ├── Toast.tsx                     # Hệ thống thông báo nổi Toast
    │   ├── Rating.tsx                    # Component hiển thị số sao đánh giá
    │   ├── CloudinaryImage.tsx           # Wrapper render ảnh tối ưu qua Cloudinary
    │   ├── ScrollReveal.tsx              # Hiệu ứng cuộn hiển thị mượt mà
    │   │
    │   ├── home/                         # Các khối giao diện Trang chủ
    │   │   ├── HeroSection.tsx           # Slider khuyến mãi từ bảng `promotions`
    │   │   ├── FeaturedProducts.tsx      # Sản phẩm bán chạy & mới nhất
    │   │   ├── CategoryStyleSlider.tsx   # Slider danh mục phong cách 3D độc đáo
    │   │   └── BrandGuaranteeSection.tsx # Khối cam kết chất lượng & chính sách bảo hành
    │   │
    │   ├── product/                      # Các khối giao diện Sản phẩm
    │   │   └── ProductDetailClient.tsx   # Client component xử lý chọn màu, ảnh gallery, reviews, mua hàng
    │   │
    │   ├── auth/                         # Giao diện Khách hàng & Tài khoản
    │   │   ├── LoginForm.tsx             # Form đăng nhập
    │   │   ├── RegisterForm.tsx          # Form đăng ký
    │   │   ├── UserSidebar.tsx           # Menu điều hướng bên trái Dashboard người dùng
    │   │   ├── AddressManager.tsx        # Trình quản lý địa chỉ nhận hàng
    │   │   ├── WishlistManager.tsx       # Trình quản lý sản phẩm yêu thích
    │   │   ├── CheckoutClient.tsx        # Trình xử lý thanh toán giỏ hàng, chọn địa chỉ, tạo order
    │   │   └── OrderActions.tsx          # Các nút hành động trên đơn hàng
    │   │
    │   └── admin/                        # Giao diện Phân hệ Quản trị (Admin)
    │       ├── AdminShell.tsx            # Khung sườn layout Admin (Navbar + Sidebar + Breadcrumb)
    │       ├── AdminSidebar.tsx          # Menu quản trị
    │       ├── AdminNavbar.tsx           # Top bar quản trị
    │       ├── DataTable.tsx             # Bảng dữ liệu tái sử dụng
    │       ├── StatsCard.tsx             # Thẻ hiển thị chỉ số KPI thống kê
    │       ├── StatusBadge.tsx           # Badge trạng thái đơn hàng và thanh toán
    │       ├── PromotionForm.tsx         # Form tạo/sửa chương trình khuyến mãi
    │       ├── PromotionToggle.tsx       # Toggle bật/tắt nhanh trạng thái ưu đãi
    │       ├── PromotionDeleteButton.tsx # Nút xác nhận xóa ưu đãi
    │       ├── HeroToggle.tsx            # Toggle ghim sản phẩm lên hero
    │       ├── ImageInputWithRemover.tsx # Input tải ảnh kèm nút kích hoạt xóa phông
    │       ├── BackgroundRemoverModal.tsx# Modal xóa nền ảnh trực tiếp
    │       └── BackgroundRemoverStudio.tsx # Màn hình studio xóa phông độc lập
    │
    ├── lib/                              # Thư viện dùng chung & Cấu hình Core
    │   ├── db.ts                         # Kết nối Neon Serverless + Drizzle ORM
    │   ├── schema.ts                     # Toàn bộ Database Schema (Tables, Indexes, Types)
    │   ├── auth.ts                       # Helper: hash, verify password, create/get/destroy session
    │   ├── cloudinary.ts                 # Helper tạo URL tối ưu qua Cloudinary
    │   └── validations.ts                # Validation regex (email, phone Việt Nam, mật khẩu)
    │
    ├── store/                            # Quản lý Trạng thái Toàn cục (Global State)
    │   ├── cartContext.tsx               # CartContext, CartProvider, useCart, ToastProvider, useToast
    │   └── authContext.tsx               # AuthContext, AuthProvider, useAuth (user info, login/logout)
    │
    ├── data/                             # Dữ liệu tĩnh & Type Interfaces
    │   └── products.ts                   # Type definition `Product`, `ProductImage`, hàm `formatPrice()`
    │
    └── types/                            # TypeScript Type Declarations bổ sung
        └── neondatabase-serverless.d.ts  # Fallback type declaration cho Neon DB
```

---

## 4. Chi tiết các Phân hệ Chức năng (System Functional Modules)

### 4.1. Trang Khách hàng (Storefront)
1. **Trang chủ (`/`)**:
   - **Hero Carousel (`HeroSection.tsx`)**: Đọc dữ liệu từ bảng `promotions` (sắp xếp theo `sortOrder`, chỉ lấy banner `isActive = true`). Hiển thị tag sự kiện, badge giảm giá, tiêu đề nổi bật, ảnh sản phẩm tách nền, danh sách ưu đãi nổi (floating perks), mã giảm giá kèm nút copy nhanh.
   - **Sản phẩm nổi bật (`FeaturedProducts.tsx`)**: Lấy từ bảng `products`, phân loại Best Seller và New Arrivals.
   - **Slider Danh mục 3D (`CategoryStyleSlider.tsx`)**: Trưng bày danh mục với hiệu ứng chuyển động, màu sắc gradient và glow lấy từ bảng `ui_configs`.
   - **Cam kết & Câu chuyện thương hiệu (`BrandGuaranteeSection.tsx`)**: Tải từ `ui_configs` (id: `home_guarantee_policy`), cho phép Admin chỉnh sửa trực tiếp mà không cần sửa code.
2. **Trang Danh sách Sản phẩm (`/san-pham`)**:
   - Hiển thị danh sách sản phẩm theo dạng lưới responsive (2 cột trên mobile, 4 cột trên desktop).
   - Hỗ trợ tìm kiếm theo từ khóa (`?q=...`).
3. **Trang Chi tiết Sản phẩm (`/san-pham/[slug]`)**:
   - SSR/SSG với `generateMetadata` và chèn thẻ `script type="application/ld+json"` (Schema.org Product).
   - Bộ chọn màu sắc (Color Swatches), điều chỉnh số lượng, gallery nhiều góc chụp.
   - Nút **"Thêm vào giỏ hàng"** và **"Mua ngay"** mở Cart Drawer hoặc chuyển hướng sang Checkout.
   - Khối Đánh giá khách hàng: Hiển thị điểm trung bình sao, danh sách đánh giá đã duyệt (`isApproved = true`), form gửi đánh giá (chỉ cho phép user đã đăng nhập, tự động gắn cờ `isVerified` nếu đã từng mua).
   - Khối Sản phẩm liên quan cùng danh mục.
4. **Trang Danh mục (`/danh-muc/[slug]`)**:
   - Hiển thị danh sách sản phẩm thuộc danh mục tương ứng kèm breadcrumb điều hướng.

---

### 4.2. Giỏ hàng & Thanh toán (Cart & Checkout Flow)
1. **Cart Context (`src/store/cartContext.tsx`)**:
   - Lưu trữ `items` (gồm `product`, `quantity`, `color`, `colorHex`).
   - Tự động đồng bộ với `localStorage` (`baloviet_cart`) sau khi hydrate.
   - Cung cấp hành động: `addItem`, `removeItem`, `updateQty`, `clear`, `openDrawer`, `closeDrawer`.
   - Tính toán tự động `totalItems` và `totalPrice`.
2. **Cart Drawer (`CartDrawer.tsx`)**:
   - Drawer trượt ra từ bên phải màn hình khi người dùng thêm sản phẩm.
   - Cho phép tăng giảm số lượng hoặc xóa nhanh sản phẩm, hiển thị tổng tiền và nút chuyển hướng đến trang thanh toán.
3. **Trang Thanh toán (`/thanh-toan`)**:
   - Tích hợp `CheckoutClient.tsx`.
   - Đối với khách hàng đã đăng nhập: Tự động tải danh sách địa chỉ từ bảng `addresses` để chọn nhanh 1 chạm.
   - Đối với khách mua vãng lai: Cung cấp form nhập thông tin nhận hàng (Họ tên, SĐT, Tỉnh/TP, Quận/Huyện, Phường/Xã, Số nhà).
   - Miễn phí vận chuyển cho đơn hàng từ **1.000.000 ₫** (phí chuẩn: **30.000 ₫** cho đơn dưới 1 triệu).
   - Phương thức thanh toán: COD (Thanh toán khi nhận hàng) hoặc Chuyển khoản ngân hàng.
   - Gọi API transactional `/api/orders` kiểm tra số lượng tồn kho thực tế, giảm `stock` và lưu thông tin đơn hàng.
4. **Trang Đặt hàng thành công (`/dat-hang-thanh-cong`)**:
   - Nhận `orderNumber` qua URL search params và hiển thị tóm tắt đơn hàng.

---

### 4.3. Xác thực & Tài khoản Người dùng (Auth & User Dashboard)
1. **Đăng ký & Đăng nhập (`/dang-ky`, `/dang-nhap`)**:
   - Kiểm tra định dạng email và số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09).
   - Mã hóa mật khẩu an toàn với `bcryptjs`.
   - Tạo session cookie HTTP-Only `baloviet_session` có thời hạn 30 ngày.
2. **Dashboard Khách hàng (`/tai-khoan/*`)**:
   - Layout thống nhất với `UserSidebar.tsx` hiển thị avatar, tên, email và các tab chức năng.
   - **Tổng quan (`/tai-khoan`)**: Xem thông tin tài khoản, đơn hàng gần đây.
   - **Đơn hàng (`/tai-khoan/don-hang`, `/tai-khoan/don-hang/[id]`)**: Lịch sử đơn hàng, xem chi tiết từng món đã đặt, trạng thái đơn và thanh toán.
   - **Sổ địa chỉ (`/tai-khoan/dia-chi`)**: Thêm/sửa/xóa địa chỉ nhận hàng, thiết lập địa chỉ mặc định.
   - **Yêu thích (`/tai-khoan/yeu-thich`)**: Quản lý Wishlist, cho phép thêm nhanh vào giỏ hàng.
   - **Đổi mật khẩu (`/tai-khoan/doi-mat-khau`)**: Form xác nhận mật khẩu cũ và nhập mật khẩu mới.

---

### 4.4. Phân hệ Quản trị (Admin Portal)
Truy cập tại `/admin`, được bảo vệ 2 lớp:
1. `src/middleware.ts` kiểm tra cookie `baloviet_session`.
2. `src/app/admin/layout.tsx` truy vấn DB xác nhận `user.role === "admin"`. Nếu không phải admin, chuyển hướng về `/`.

**Các tính năng quản trị:**
1. **Tổng quan (`/admin`)**: Thống kê Tổng doanh thu, Tổng đơn hàng, Tổng khách hàng, Tổng sản phẩm, danh sách 5 đơn hàng mới nhất.
2. **Quản lý Đơn hàng (`/admin/don-hang`, `[id]`)**:
   - Bảng danh sách đơn hàng có tìm kiếm và phân loại theo trạng thái (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
   - Trang chi tiết đơn hàng: Cập nhật trạng thái xử lý, trạng thái thanh toán (`unpaid`, `paid`, `refunded`), ghi chú của admin (`adminNote`).
3. **Quản lý Sản phẩm (`/admin/san-pham`, `tao-moi`, `[id]`)**:
   - Xem danh mục sản phẩm, tồn kho, giá bán, giá sale, trạng thái Hot/New.
   - Form thêm/sửa sản phẩm: Nhập thông số kỹ thuật dạng key-value, tags, màu sắc (tên màu + mã hex), bộ sưu tập ảnh (Cloudinary URL hoặc Base64).
   - Tích hợp sẵn nút **"Xóa phông ảnh (Tạo PNG)"** ngay tại ô nhập link ảnh.
4. **Quản lý Ưu đãi & Banner Hero (`/admin/uu-dai`, `tao-moi`, `[id]`)**:
   - Quản lý các chiến dịch khuyến mãi (Flash Sale, Member, Combo, Eco Trade-in).
   - Tùy chỉnh Tagline, Badge giảm giá, Tiêu đề, Đoạn mô tả, Mã voucher, Quà tặng kèm, Thứ tự hiển thị (`sortOrder`), Bật/Tắt hiển thị (`isActive`).
5. **Quản lý Cam kết & Giới thiệu (`/admin/cam-ket`)**:
   - Cho phép chỉnh sửa tiêu đề cam kết, thẻ bảo hành 24 tháng, thẻ đổi trả 30 ngày, câu chuyện thương hiệu và danh sách lý do chọn Balo Việt. Lưu trực tiếp vào bảng `ui_configs`.
6. **Studio Xóa phông AI (`/admin/xoa-phong`)**:
   - Trang công cụ xử lý ảnh chuyên dụng: Kéo thả ảnh hoặc tải file từ máy tính, thư viện WASM `@imgly/background-removal` tự động bóc tách nền trong vài giây, cho phép tải về PNG trong suốt hoặc copy trực tiếp DataURL.
7. **Quản lý Khách hàng (`/admin/khach-hang`, `[id]`)**:
   - Xem thông tin khách hàng, số lượng đơn hàng đã đặt, tổng chi tiêu.
   - Chức năng Khóa / Mở khóa tài khoản (`isActive`).
8. **Quản lý Danh mục (`/admin/danh-muc`)**:
   - CRUD danh mục sản phẩm (Tên, slug, mô tả, số lượng sản phẩm).
9. **Quản lý Đánh giá (`/admin/danh-gia`)**:
   - Bảng kiểm duyệt đánh giá từ khách hàng: Xem số sao, nội dung, sản phẩm đánh giá, huy hiệu Đã mua hàng (`isVerified`), thao tác Duyệt hiển thị (`isApproved`), Từ chối hoặc Xóa vĩnh viễn.

---

## 5. Danh mục REST API (`src/app/api/`)

| Method | Endpoint | Mô tả | Quyền hạn |
|---|---|---|---|
| **POST** | `/api/auth/register` | Đăng ký tài khoản khách hàng mới | Public |
| **POST** | `/api/auth/login` | Đăng nhập tài khoản & set session cookie | Public |
| **POST** | `/api/auth/logout` | Hủy session trong DB & xóa cookie | Public |
| **GET** | `/api/auth/me` | Lấy thông tin user hiện tại từ session | Public |
| **POST** | `/api/auth/change-password` | Đổi mật khẩu tài khoản | Logged-in |
| **POST** | `/api/orders` | Tạo đơn hàng mới & giảm số lượng tồn kho (Transaction) | Public / User |
| **GET** | `/api/reviews` | Lấy danh sách đánh giá đã duyệt theo `productId` | Public |
| **POST** | `/api/reviews` | Gửi đánh giá mới cho sản phẩm (Chờ duyệt) | Logged-in |
| **GET** | `/api/search` | Tìm kiếm sản phẩm theo từ khóa (ILIKE tên & mô tả) | Public |
| **GET/POST/PUT/DELETE** | `/api/user/addresses` | Quản lý sổ địa chỉ giao hàng của user | Logged-in |
| **PUT** | `/api/user/profile` | Cập nhật thông tin cá nhân (họ tên, SĐT) | Logged-in |
| **GET/POST/DELETE** | `/api/user/wishlist` | Thêm, xóa, xem danh sách sản phẩm yêu thích | Logged-in |
| **GET/POST/PUT/DELETE** | `/api/admin/orders` & `[id]` | Quản lý danh sách đơn, xem chi tiết, cập nhật trạng thái | Admin |
| **GET/POST/PUT/DELETE** | `/api/admin/products` & `[id]` | Lấy danh sách, tạo mới, cập nhật, xóa sản phẩm | Admin |
| **GET/PUT** | `/api/admin/customers` & `[id]` | Xem danh sách khách, chi tiết đơn, khóa/mở tài khoản | Admin |
| **GET/POST/PUT/DELETE** | `/api/admin/categories` & `[id]` | Thêm, sửa, xóa danh mục sản phẩm | Admin |
| **GET/POST/PUT/DELETE** | `/api/admin/promotions` & `[id]` | Quản lý chương trình khuyến mãi & Hero Carousel | Admin |
| **GET/POST** | `/api/admin/home-policy` | Lấy & lưu cấu hình chính sách cam kết trang chủ | Admin |
| **GET/PUT/DELETE** | `/api/admin/reviews` & `[id]` | Kiểm duyệt đánh giá (Duyệt/Từ chối/Xóa) | Admin |
| **GET** | `/api/seed-admin` | Endpoint tiện ích seed tài khoản admin | Public |

---

## 6. Cơ sở dữ liệu & Data Models (`src/lib/schema.ts`)

### Sơ đồ Bảng Dữ liệu (PostgreSQL via Drizzle):

1. **`users`**:
   - `id` (text, PK), `email` (unique, indexed), `passwordHash` (text), `fullName` (text), `phone` (text), `avatar` (text), `role` (text: `"customer"` | `"admin"`, default: `"customer"`, indexed), `isActive` (boolean, default: true), `emailVerified` (boolean), `createdAt`, `updatedAt`.
2. **`sessions`**:
   - `id` (text, PK, nanoid 32), `userId` (text, FK -> `users.id` cascade, indexed), `expiresAt` (timestamp), `userAgent` (text), `ipAddress` (text), `createdAt`.
3. **`products`**:
   - `id` (text, PK, ví dụ: `"bv-001"`), `name` (text), `slug` (text, unique, indexed), `sku` (text, unique), `price` (integer - VND), `salePrice` (integer), `categorySlug` (text, indexed), `stock` (integer, default: 0), `rating` (real, default: 0), `reviews` (integer, default: 0), `shortDescription` (text), `description` (text), `specifications` (jsonb: `Record<string, string>`), `tags` (text array), `colors` (jsonb: `{name: string, hex: string}[]`), `isBestSeller` (boolean), `isNew` (boolean), `isHeroFeatured` (boolean), `imageIds` (text array), `imageAlts` (text array), `createdAt`, `updatedAt`.
4. **`categories`**:
   - `id` (text, PK), `name` (text), `slug` (text, unique), `description` (text), `imageId` (text), `imageAlt` (text), `count` (integer), `metaTitle` (text), `metaDescription` (text).
5. **`orders`**:
   - `id` (text, PK, nanoid), `orderNumber` (text, unique, indexed, e.g. `ORD-20260827-XYZ1`), `userId` (text, FK -> `users.id` on delete set null, indexed), `customerName` (text), `customerEmail` (text), `customerPhone` (text), `shippingAddress` (jsonb: `{fullName, phone, province, district, ward, street}`), `subtotal` (integer), `shippingFee` (integer), `discount` (integer), `total` (integer), `status` (text, indexed: `"pending"` | `"processing"` | `"shipped"` | `"delivered"` | `"cancelled"`), `paymentMethod` (text: `"cod"` | `"banking"`), `paymentStatus` (text: `"unpaid"` | `"paid"` | `"refunded"`), `note` (text), `adminNote` (text), `createdAt`, `updatedAt`.
6. **`order_items`**:
   - `id` (text, PK), `orderId` (text, FK -> `orders.id` cascade, indexed), `productId` (text), `productName` (text), `productImage` (text), `productSlug` (text), `color` (text), `colorHex` (text), `price` (integer), `quantity` (integer), `subtotal` (integer).
7. **`addresses`**:
   - `id` (text, PK), `userId` (text, FK -> `users.id` cascade, indexed), `fullName` (text), `phone` (text), `province` (text), `district` (text), `ward` (text), `street` (text), `isDefault` (boolean), `createdAt`.
8. **`wishlist_items`**:
   - `id` (text, PK), `userId` (text, FK -> `users.id` cascade, composite index với `productId`), `productId` (text), `createdAt`.
9. **`product_reviews`**:
   - `id` (text, PK), `productId` (text, indexed), `userId` (text, FK -> `users.id` cascade, indexed), `orderId` (text, FK -> `orders.id` set null), `rating` (integer 1-5), `title` (text), `content` (text), `isVerified` (boolean), `isApproved` (boolean, default: false), `createdAt`.
10. **`promotions`**:
    - `id` (text, PK), `tag` (text), `badge` (text), `title` (text), `highlight` (text), `description` (text), `code` (text), `discountValue` (text), `minOrder` (text), `giftText` (text), `ctaText` (text), `targetUrl` (text), `imageUrl` (text), `originalPrice` (integer), `salePrice` (integer), `floatingPerks` (text array), `sortOrder` (integer, indexed), `isActive` (boolean, indexed), `createdAt`, `updatedAt`.
11. **`ui_configs`**:
    - `id` (text, PK, ví dụ: `"home_guarantee_policy"` hoặc `"slider_cat_1"`), `type` (text), `targetId` (text), `gradient` (text), `glowColor` (text), `shapeClass` (text), `badge` (text), `spec` (text - JSON string chứa cấu hình linh hoạt).
12. **`blog_posts`**:
    - `id` (text, PK), `title` (text), `slug` (text, unique), `excerpt` (text), `content` (text), `imageId` (text), `tags` (text array), `publishedAt`, `metaTitle`, `metaDescription`.
13. **`newsletter_subscribers`**:
    - `id` (text, PK), `email` (text, unique), `subscribedAt`.

---

## 7. Quy trình Xác thực & Phân quyền (Auth Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng / Admin
    participant Browser as Trình duyệt (Client)
    participant MW as Middleware (Edge)
    participant Route as Next.js Page / API
    participant DB as Neon PostgreSQL

    Note over User,Browser: Đăng nhập
    User->>Browser: Nhập email & password
    Browser->>Route: POST /api/auth/login
    Route->>DB: Truy vấn user & so sánh bcrypt hash
    DB-->>Route: User hợp lệ
    Route->>DB: Tạo session mới (TTL 30 ngày)
    Route-->>Browser: Set-Cookie: baloviet_session=<sessionId>; HttpOnly; SameSite=Lax
    
    Note over Browser,Route: Truy cập route bảo vệ (/tai-khoan hoặc /admin)
    Browser->>MW: Request URL /admin/... (kèm Cookie)
    alt Không có Cookie
        MW-->>Browser: Redirect -> /dang-nhap?redirect=/admin
    else Có Cookie
        MW->>Route: Cho phép Next()
        Route->>DB: getSession() xác thực user và role
        alt Role !== "admin" tại trang /admin
            Route-->>Browser: Redirect -> /
        else Hợp lệ
            Route-->>Browser: Render Dashboard UI
        end
    end
```

---

## 8. Biến môi trường Cần thiết (`.env`)

```env
# =============================================
# DATABASE (Neon Serverless PostgreSQL)
# =============================================
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require"

# =============================================
# CLOUDINARY (CDN Lưu trữ & Tối ưu Ảnh)
# =============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# =============================================
# GOOGLE GEMINI AI (Tìm kiếm ngữ nghĩa & Mô tả)
# =============================================
GEMINI_API_KEY="your_gemini_api_key"
```

---

## 9. Hướng dẫn Lệnh & Vận hành (Commands & Workflows)

| Lệnh | Ý nghĩa & Mục đích |
|---|---|
| `npm run dev` | Khởi động development server Next.js (mặc định cổng 3000). |
| `npm run build` | Build ứng dụng phục vụ production (kiểm tra type errors và SSG pages). |
| `npm run start` | Chạy production server sau khi build. |
| `npm run format` | Định dạng toàn bộ mã nguồn với `oxfmt`. |
| `npm run db:generate` | Sinh các file migration mới vào thư mục `drizzle/` dựa trên `src/lib/schema.ts`. |
| `npm run db:migrate` | Áp dụng các migration lên cơ sở dữ liệu Neon PostgreSQL. |
| `npm run db:seed` | Chạy `scripts/migrate-all-data.ts` – Khởi tạo toàn bộ danh mục, sản phẩm mẫu, UI config và tài khoản admin mặc định. |
| `npm run db:seed-admin` | Chạy `scripts/seed-admin.ts` – Tạo nhanh tài khoản admin nếu chưa có (`admin@baloviet.vn` / `Admin@2026`). |
| `npx tsx scripts/init-promotions.ts` | Tạo bảng `promotions` và seed 4 chương trình ưu đãi mẫu cho Hero Section. |

> **Tài khoản Admin mặc định**:
> - Email: `admin@baloviet.vn`
> - Mật khẩu: `Admin@2026`

---

## 10. Nguyên tắc Thiết kế & Lưu ý Trọng yếu cho AI / Lập trình viên

1. **Next.js 15 Async Request APIs**:
   - `params` và `searchParams` trong các Page Component và Route Handlers là `Promise`. Phải sử dụng:
     ```typescript
     // Page component:
     export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
       const { slug } = await params;
       // ...
     }
     ```
   - Tương tự, `cookies()` từ `next/headers` là hàm bất đồng bộ: `const cookieStore = await cookies();`.
2. **Server Components vs Client Components**:
   - Mặc định toàn bộ Page và Layout là **Server Components**.
   - Chỉ thêm `"use client"` khi component cần sử dụng React hooks (`useState`, `useEffect`, `useReducer`), sự kiện người dùng (`onClick`, `onChange`), hoặc Client Context (`useCart`, `useAuth`, `useToast`).
   - Giữ Client Components càng nhỏ gọn và nằm ở ngọn cây component càng tốt.
3. **Drizzle ORM & Neon HTTP Driver**:
   - Sử dụng cú pháp Drizzle ORM để tương tác với database.
   - Khi tạo hoặc cập nhật các liên kết quan hệ trong bảng `orders`, sử dụng `db.transaction()` để đảm bảo toàn vẹn dữ liệu (trừ số lượng `stock` của từng sản phẩm).
4. **Quy ước Định dạng Tiền tệ**:
   - Luôn sử dụng hàm tiện ích `formatPrice(amount)` trong `src/data/products.ts` để hiển thị tiền tệ đồng nhất theo chuẩn Việt Nam (VND), ví dụ: `890.000 ₫`.
5. **Quy ước Màu sắc & Giao diện**:
   - Nền tối chủ đạo: `bg-[#0B0D0E]` hoặc `bg-brand-black`.
   - Card/Khối phụ: `bg-[#161819]` hoặc `bg-brand-card`, viền `border-[#2A2C2F]`.
   - Điểm nhấn vàng gold: `text-[#F5B800]` hoặc `bg-[#F5B800]`.
   - Font heading: `font-display uppercase tracking-tight` (`Barlow Condensed`).
   - Riêng khu vực Admin (`/admin`): Sử dụng giao diện sáng thanh lịch (`bg-gray-50`, text `gray-900`, điểm nhấn `amber-600`) kết hợp cùng sidebar tối màu (`bg-gray-900`).
6. **Xử lý Ảnh & Background Removal**:
   - Luôn hỗ trợ cả đường dẫn URL ngoài (`https://...`), Cloudinary ID, và chuỗi Base64 DataURL (`data:image/png;base64,...`) do studio xóa phông tạo ra.
