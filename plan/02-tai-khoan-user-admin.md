# Kế hoạch Xây dựng Hệ thống Tài khoản User & Admin – Balo Việt

## Tổng quan

Xây dựng hệ thống xác thực (authentication) và phân quyền (authorization) hoàn chỉnh cho website thương mại điện tử Balo Việt:
- **User (Khách hàng)**: Đăng ký, đăng nhập, quản lý thông tin cá nhân, lịch sử đơn hàng, danh sách yêu thích
- **Admin**: Dashboard quản trị với đầy đủ nghiệp vụ TMĐT (sản phẩm, đơn hàng, khách hàng, thống kê doanh thu)

### Kiến trúc hiện tại

| Hạng mục | Hiện trạng |
|----------|-----------|
| Framework | Next.js 15 App Router |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | ❌ Chưa có |
| Styling | Tailwind CSS v4 |
| State | React Context (cart, toast) |
| API | Route Handlers (`src/app/api/`) |

> **Auth Strategy**: Session-based Auth tự xây (bcrypt + session cookie), không dùng NextAuth/Clerk, phù hợp dự án đang dùng Neon + Drizzle.

---

## Open Questions

1. **Auth provider**: Dùng auth tự build hay NextAuth.js (hỗ trợ đăng nhập Google/Facebook)?
2. **Payment**: Chỉ COD + Chuyển khoản hay cần tích hợp VNPay/MoMo?
3. **Email service**: Dùng Resend, Nodemailer, hay chưa cần email xác nhận?
4. **Admin đầu tiên**: Tạo bằng script seed hay có trang đăng ký admin?

---

## Proposed Changes

### 🗄️ Phase 1 – Database Schema mở rộng

#### [MODIFY] `src/lib/schema.ts`

Thêm các bảng mới:

```typescript
// ===== USERS =====
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== SESSIONS =====
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

// ===== ADDRESSES =====
export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  province: text("province").notNull(),
  district: text("district").notNull(),
  ward: text("ward").notNull(),
  street: text("street").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== ORDERS =====
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    fullName: string; phone: string;
    province: string; district: string; ward: string; street: string;
  }>().notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  // "pending" → "confirmed" → "processing" → "shipping" → "delivered" → "completed"
  // hoặc → "cancelled" | "returned"
  paymentMethod: text("payment_method").notNull(), // "cod" | "bank_transfer"
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  note: text("note"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== ORDER ITEMS =====
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  productSlug: text("product_slug"),
  color: text("color"),
  colorHex: text("color_hex"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),
});

// ===== WISHLIST =====
export const wishlistItems = pgTable("wishlist_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== PRODUCT REVIEWS =====
export const productReviews = pgTable("product_reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: text("order_id").references(() => orders.id),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  content: text("content"),
  isVerified: boolean("is_verified").default(false),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

### 🔐 Phase 2 – Authentication Core

#### [NEW] `src/lib/auth.ts`

- `hashPassword(password)` – bcryptjs hash
- `verifyPassword(password, hash)` – bcryptjs compare
- `generateSessionId()` – nanoid 32 ký tự
- `createSession(userId)` – tạo session DB, set cookie HttpOnly
- `getSession(request)` – đọc cookie → validate → trả user
- `destroySession(sessionId)` – xóa session + cookie
- `requireAuth(request)` – middleware kiểm tra đăng nhập
- `requireAdmin(request)` – middleware kiểm tra quyền admin

Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, expire 30 ngày, name `baloviet_session`

#### [NEW] `src/lib/validations.ts`

- `validateEmail(email)` – regex + length
- `validatePassword(password)` – min 8 ký tự, chữ hoa + số
- `validatePhone(phone)` – regex VN (03x, 05x, 07x, 08x, 09x)
- `validateFullName(name)` – min 2 ký tự

#### Dependencies mới: `bcryptjs`, `nanoid`, `@types/bcryptjs`

---

### 🔑 Phase 3 – Auth API Routes

#### [NEW] `src/app/api/auth/register/route.ts`
```
POST /api/auth/register
Body: { email, password, fullName, phone? }
→ Validate → Check unique → Hash password → Insert user → Tạo session → Trả user
Errors: 400 (validation), 409 (email trùng)
```

#### [NEW] `src/app/api/auth/login/route.ts`
```
POST /api/auth/login
Body: { email, password }
→ Tìm user → Verify password → Check isActive → Tạo session → Trả user
Errors: 400, 401, 403
```

#### [NEW] `src/app/api/auth/logout/route.ts`
```
POST /api/auth/logout → Xóa session DB + cookie
```

#### [NEW] `src/app/api/auth/me/route.ts`
```
GET /api/auth/me → Đọc session cookie → Trả user hoặc null
```

#### [NEW] `src/app/api/auth/change-password/route.ts`
```
POST – Auth required. Body: { currentPassword, newPassword }
```

---

### 👤 Phase 4 – Auth Context & State

#### [NEW] `src/store/authContext.tsx`

```
AuthProvider bọc app
State: { user, isLoading, isAuthenticated }
Actions: login(), register(), logout(), refreshUser()
Hook: useAuth()
```

#### [MODIFY] `src/app/layout.tsx` – Thêm `<AuthProvider>` bọc `<CartProvider>`

---

### 📄 Phase 5 – Trang Đăng nhập / Đăng ký

#### [NEW] `src/app/dang-nhap/page.tsx`
- Form: Email + Password + Show/hide toggle
- "Ghi nhớ đăng nhập" checkbox
- Error inline
- Redirect `?redirect=` sau login
- Link → Đăng ký

#### [NEW] `src/app/dang-ky/page.tsx`
- Form: Họ tên, Email, SĐT, Password + strength indicator, Confirm password
- Checkbox đồng ý điều khoản
- Auto-login sau đăng ký
- Link → Đăng nhập

---

### 🏠 Phase 6 – Dashboard User (Khách hàng)

**URL Structure:**
```
/tai-khoan              → Dashboard tổng quan
/tai-khoan/don-hang     → Lịch sử đơn hàng
/tai-khoan/don-hang/[id]→ Chi tiết đơn hàng
/tai-khoan/dia-chi      → Quản lý địa chỉ
/tai-khoan/yeu-thich    → Sản phẩm yêu thích
/tai-khoan/doi-mat-khau → Đổi mật khẩu
```

#### [NEW] `src/app/tai-khoan/layout.tsx` – Layout sidebar
- Sidebar: Avatar + tên, nav links (Tổng quan, Đơn hàng, Địa chỉ, Yêu thích, Đổi MK, Đăng xuất)
- Badge đếm (đơn hàng, yêu thích)
- Responsive: bottom nav trên mobile
- Redirect `/dang-nhap` nếu chưa auth

#### [MODIFY] `src/app/tai-khoan/page.tsx` – Dashboard
- 4 stat cards (Đơn hàng, Đang giao, Yêu thích, Đánh giá)
- Đơn hàng gần đây (3 đơn)

#### [NEW] `src/app/tai-khoan/don-hang/page.tsx`
- Danh sách đơn hàng phân trang
- Filter trạng thái
- Mỗi đơn: Mã, ngày, số SP, tổng, trạng thái badge

#### [NEW] `src/app/tai-khoan/don-hang/[id]/page.tsx`
- Timeline trạng thái (stepper)
- Sản phẩm đã mua (ảnh, tên, màu, SL, giá)
- Thông tin giao hàng
- Nút: Hủy đơn (pending), Đã nhận (shipping), Đánh giá (completed)

#### [NEW] `src/app/tai-khoan/dia-chi/page.tsx`
- CRUD địa chỉ (modal form), tối đa 5, đặt mặc định

#### [NEW] `src/app/tai-khoan/yeu-thich/page.tsx`
- Grid sản phẩm yêu thích, xóa, thêm giỏ nhanh

#### [NEW] `src/app/tai-khoan/doi-mat-khau/page.tsx`
- Form: MK cũ, MK mới, Xác nhận MK mới + strength indicator

---

### 🛒 Phase 7 – Checkout đầy đủ

#### [MODIFY] `src/app/thanh-toan/page.tsx`
- 2 cột: Form giao hàng (trái) + Tóm tắt đơn (phải)
- Nếu login: chọn địa chỉ đã lưu hoặc nhập mới
- Nếu guest: nhập form
- Phương thức: COD / Chuyển khoản
- Ghi chú đơn hàng

#### [NEW] `src/app/api/orders/route.ts`
```
POST /api/orders – Tạo đơn hàng
→ Validate → Verify stock → Calculate totals → Generate order number
→ Insert order + items → Giảm stock → Trả order info

GET /api/orders – Đơn hàng user (auth)
GET /api/orders/[id] – Chi tiết
PUT /api/orders/[id]/cancel – Hủy (chỉ pending)
PUT /api/orders/[id]/received – Xác nhận nhận hàng
```

#### [NEW] `src/app/dat-hang-thanh-cong/page.tsx` – Trang thành công

---

### 🔌 Phase 8 – API Routes bổ sung (User)

#### [NEW] `src/app/api/user/profile/route.ts` – GET/PUT profile
#### [NEW] `src/app/api/user/addresses/route.ts` – CRUD địa chỉ
#### [NEW] `src/app/api/user/wishlist/route.ts` – CRUD wishlist
#### [NEW] `src/app/api/reviews/route.ts` – POST review, GET reviews by product

---

### 👑 Phase 9 – Admin Dashboard

**URL Structure:**
```
/admin                    → Dashboard thống kê
/admin/don-hang           → Quản lý đơn hàng
/admin/don-hang/[id]      → Chi tiết & xử lý đơn
/admin/san-pham           → Quản lý sản phẩm
/admin/san-pham/tao-moi   → Thêm sản phẩm
/admin/san-pham/[id]      → Sửa sản phẩm
/admin/khach-hang         → Quản lý khách hàng
/admin/khach-hang/[id]    → Chi tiết KH
/admin/danh-muc           → Quản lý danh mục
/admin/danh-gia           → Quản lý đánh giá
```

#### [NEW] `src/app/admin/layout.tsx`
- Sidebar cố định: Logo ADMIN, nav icons + labels
- Badge đơn hàng mới
- Không dùng chung Header/Footer với shop
- Check `role === "admin"`, redirect nếu không phải

#### [NEW] `src/app/admin/page.tsx` – Dashboard
- 4 stat cards: Doanh thu, Đơn hàng, Khách hàng, Sản phẩm (có % so tháng trước)
- Biểu đồ doanh thu 7 ngày (CSS bar chart)
- Đơn hàng mới nhất (5 đơn)
- Top sản phẩm bán chạy
- Phân bố trạng thái đơn hàng

#### [NEW] `src/app/admin/don-hang/page.tsx`
- Table: Mã, KH, SĐT, Tổng tiền, Status, Payment, Ngày, Actions
- Filter + Search + Sort + Pagination (20/trang)
- Bulk update trạng thái

#### [NEW] `src/app/admin/don-hang/[id]/page.tsx`
- Full info + Timeline + Cập nhật status (dropdown) + Admin note + Cập nhật payment + In đơn

#### [NEW] `src/app/admin/san-pham/page.tsx`
- Table: Ảnh, Tên, SKU, Giá, Sale, Danh mục, Tồn kho
- Search, filter danh mục, filter tồn kho
- Quick edit stock inline
- Toggle hiển thị/ẩn SP

#### [NEW] `src/app/admin/san-pham/tao-moi/page.tsx`
- Form: Tên, Slug (auto), SKU, Giá, Giá sale, Danh mục, Mô tả, Ảnh, Màu sắc, Specs, Tags

#### [NEW] `src/app/admin/san-pham/[id]/page.tsx` – Sửa SP (pre-fill)

#### [NEW] `src/app/admin/khach-hang/page.tsx`
- Table: Avatar, Tên, Email, SĐT, Số đơn, Tổng chi tiêu, Ngày ĐK, Status
- Search + Khóa/Mở khóa

#### [NEW] `src/app/admin/khach-hang/[id]/page.tsx` – Chi tiết + lịch sử đơn

#### [NEW] `src/app/admin/danh-muc/page.tsx` – CRUD danh mục

#### [NEW] `src/app/admin/danh-gia/page.tsx` – Duyệt/Từ chối reviews

---

### 🔌 Phase 10 – Admin API Routes

```
GET  /api/admin/dashboard           – Thống kê tổng
GET  /api/admin/orders              – Danh sách đơn (filter, page, search)
PUT  /api/admin/orders/[id]/status  – Cập nhật trạng thái
PUT  /api/admin/orders/[id]/payment – Cập nhật thanh toán
PUT  /api/admin/orders/[id]/note    – Ghi chú admin
CRUD /api/admin/products            – Quản lý SP
CRUD /api/admin/customers           – Quản lý KH
CRUD /api/admin/categories          – Quản lý danh mục
CRUD /api/admin/reviews             – Duyệt đánh giá
```

Tất cả admin routes đều check `requireAdmin()`.

---

### 🧩 Phase 11 – Shared Components mới

**Auth:**
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/PasswordInput.tsx` – Toggle show/hide
- `src/components/auth/PasswordStrength.tsx` – Strength bar

**Admin:**
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/StatsCard.tsx`
- `src/components/admin/DataTable.tsx` – Reusable (sort, filter, pagination)
- `src/components/admin/StatusBadge.tsx` – Badge màu theo status
- `src/components/admin/OrderTimeline.tsx`
- `src/components/admin/BarChart.tsx` – CSS-only

**UI chung:**
- `src/components/ui/Modal.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/LoadingSpinner.tsx`

---

### 🛡️ Phase 12 – Middleware bảo vệ route

#### [NEW] `src/middleware.ts`

```
/tai-khoan/* → redirect /dang-nhap nếu chưa login
/admin/*     → redirect /dang-nhap nếu chưa login → redirect / nếu role !== admin
/dang-nhap, /dang-ky → redirect /tai-khoan nếu đã login
```

---

### 📦 Phase 13 – Dependencies & Scripts

```json
// package.json
"dependencies": { "bcryptjs": "^3.0.0", "nanoid": "^5.0.0" },
"devDependencies": { "@types/bcryptjs": "^2.4.0" },
"scripts": { "db:seed-admin": "npx tsx scripts/seed-admin.ts" }
```

#### [NEW] `scripts/seed-admin.ts`
- Tạo admin: `admin@baloviet.vn` / `Admin@2026` / role=admin
- In credentials, yêu cầu đổi password ngay

---

### 🔄 Phase 14 – Tích hợp Header & UI hiện tại

#### [MODIFY] `src/components/Header.tsx`
- Đã login → Avatar circle (chữ cái đầu) → link /tai-khoan
- Chưa login → Icon user → link /dang-nhap

#### [MODIFY] `src/components/ProductCard.tsx`
- Thêm nút ❤️ yêu thích (chỉ hiện khi đã login)

---

## Cấu trúc thư mục sau khi hoàn thành

```
src/
├── app/
│   ├── dang-nhap/page.tsx
│   ├── dang-ky/page.tsx
│   ├── tai-khoan/
│   │   ├── layout.tsx, page.tsx
│   │   ├── don-hang/ (page.tsx, [id]/page.tsx)
│   │   ├── dia-chi/page.tsx
│   │   ├── yeu-thich/page.tsx
│   │   └── doi-mat-khau/page.tsx
│   ├── thanh-toan/page.tsx (nâng cấp)
│   ├── dat-hang-thanh-cong/page.tsx
│   ├── admin/
│   │   ├── layout.tsx, page.tsx
│   │   ├── don-hang/ (page.tsx, [id]/page.tsx)
│   │   ├── san-pham/ (page.tsx, tao-moi/page.tsx, [id]/page.tsx)
│   │   ├── khach-hang/ (page.tsx, [id]/page.tsx)
│   │   ├── danh-muc/page.tsx
│   │   └── danh-gia/page.tsx
│   └── api/
│       ├── auth/ (register, login, logout, me, change-password)
│       ├── orders/route.ts
│       ├── user/ (profile, addresses, wishlist)
│       ├── reviews/route.ts
│       └── admin/ (dashboard, orders, products, customers, categories, reviews)
├── components/
│   ├── auth/ (LoginForm, RegisterForm, PasswordInput, PasswordStrength)
│   ├── admin/ (Sidebar, StatsCard, DataTable, StatusBadge, Timeline, BarChart)
│   └── ui/ (Modal, Pagination, EmptyState, LoadingSpinner)
├── lib/ (auth.ts, validations.ts, schema.ts mở rộng)
├── store/ (authContext.tsx mới, cartContext.tsx giữ nguyên)
└── middleware.ts
```

---

## Thứ tự & Ước tính thời gian

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Database Schema | 45 phút |
| 2 | Auth Core | 30 phút |
| 3 | Auth API Routes | 45 phút |
| 4 | Auth Context + Middleware | 30 phút |
| 5 | Login/Register UI | 1 giờ |
| 6 | User Dashboard | 2-3 giờ |
| 7 | Checkout + Order API | 1.5 giờ |
| 8 | User API bổ sung | 1 giờ |
| 9 | Admin Dashboard UI | 3-4 giờ |
| 10 | Admin API Routes | 1.5 giờ |
| 11 | Shared Components | 1 giờ |
| 12 | Middleware route protection | 20 phút |
| 13 | Dependencies + Seed admin | 15 phút |
| 14 | Header/ProductCard tích hợp | 30 phút |

> **Tổng: ~14-18 giờ**

> **Gợi ý**: Chia 2 sprint:
> - **Sprint 1** (Phase 1-7): Auth + User + Checkout → Website hoạt động TMĐT
> - **Sprint 2** (Phase 8-14): Admin + Reviews + Tối ưu → Quản trị đầy đủ
