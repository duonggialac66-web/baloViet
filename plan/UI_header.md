# Kế hoạch triển khai: Hero Section động & Tự động xóa nền (Cloudinary)

Mục tiêu: Cho phép Admin chọn sản phẩm để hiển thị lên Hero Section (Header). Hệ thống sẽ tự động lấy ảnh sản phẩm đó, xóa nền và hiển thị theo layout (tương tự thiết kế PACKX).

> [!IMPORTANT]
> **Yêu cầu về Cloudinary:** Để tính năng tự động xóa nền hoạt động, bạn **bắt buộc** phải kích hoạt Add-on **"Cloudinary AI Background Removal"** (miễn phí) trong phần cài đặt của tài khoản Cloudinary của bạn. Nếu không bật, ảnh sẽ bị lỗi khi gọi API.

## Proposed Changes

### 1. Database Schema
#### [MODIFY] [schema.ts](file:///d:/Lac/src/lib/schema.ts)
- Thêm cột `isHeroFeatured: boolean("is_hero_featured").default(false)` vào bảng `products`. Cột này dùng để đánh dấu các sản phẩm được chọn lên Hero.

### 2. API Routes
#### [NEW] [route.ts](file:///d:/Lac/src/app/api/admin/products/[id]/hero/route.ts)
- Tạo API route `PATCH /api/admin/products/[id]/hero` để Admin bật/tắt cờ `isHeroFeatured` cho một sản phẩm cụ thể.

### 3. Admin UI
#### [MODIFY] [ProductForm.tsx](file:///d:/Lac/src/app/admin/san-pham/tao-moi/page.tsx) (hoặc trang edit)
- Thêm một Switch/Checkbox: "Hiển thị trên Hero Section (Trang chủ)".
- *Hoặc* thêm một nút thao tác nhanh trong danh sách sản phẩm `AdminProductsTable` để toggle trạng thái này.

### 4. Cloudinary Integration
#### [MODIFY] [cloudinary.ts](file:///d:/Lac/src/lib/cloudinary.ts)
- Thêm tùy chọn `removeBackground?: boolean` vào `CloudinaryOptions`.
- Cập nhật logic `buildCloudinaryUrl` để nối thêm parameter `e_background_removal` khi `removeBackground = true`.

### 5. Frontend UI (Trang chủ)
#### [MODIFY] [page.tsx](file:///d:/Lac/src/app/page.tsx)
- Fetch danh sách sản phẩm có `isHeroFeatured == true` từ database (Drizzle ORM).
- Truyền danh sách này vào component `HeroSection`.

#### [MODIFY] [HeroSection.tsx](file:///d:/Lac/src/components/home/HeroSection.tsx)
- Thay thế mảng ảnh tĩnh hiện tại bằng dữ liệu `products` thực tế được truyền từ server.
- Sử dụng hàm `buildCloudinaryUrl` với cờ `removeBackground: true` để render ảnh sản phẩm ở chính giữa.
- Cập nhật thông tin (Tên sản phẩm, mô tả ngắn, giá) tương ứng với sản phẩm đang được chọn (dựa trên `heroIndex`).

## Verification Plan

### Manual Verification
1. Đăng nhập Admin, vào quản lý sản phẩm.
2. Chọn 3-4 sản phẩm và bật cờ "Hiển thị trên Hero Section".
3. Ra trang chủ:
   - Hero Section hiển thị đúng các sản phẩm vừa chọn.
   - Ảnh sản phẩm bị xóa phông nền hoàn toàn (trong suốt) và đổ bóng xuống background.
   - Chuyển slide (nút `< >`) hoạt động mượt mà và cập nhật thông tin sản phẩm tương ứng.
