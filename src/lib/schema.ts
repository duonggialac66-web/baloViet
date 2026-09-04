import { pgTable, text, integer, real, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),           // "bv-001"
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  price: integer("price").notNull(),      // VND (no decimals)
  salePrice: integer("sale_price"),
  categorySlug: text("category_slug").notNull(),
  stock: integer("stock").notNull().default(0),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  specifications: jsonb("specifications").$type<Record<string, string>>(),
  tags: text("tags").array(),
  colors: jsonb("colors").$type<{name: string; hex: string}[]>(),
  isBestSeller: boolean("is_best_seller").default(false),
  isNew: boolean("is_new").default(false),
  isHeroFeatured: boolean("is_hero_featured").default(false),
  imageIds: text("image_ids").array(),    // ["products/bv-001/main", ...]
  imageAlts: text("image_alts").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("products_slug_idx").on(table.slug),
  categoryIdx: index("products_category_idx").on(table.categorySlug),
}));

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageId: text("image_id"),       // Cloudinary public ID
  imageAlt: text("image_alt"),
  count: integer("count").notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const uiConfigs = pgTable("ui_configs", {
  id: text("id").primaryKey(), // "slider_cat_1"
  type: text("type").notNull(), // "category_slider"
  targetId: text("target_id").notNull(), // category slug or id
  gradient: text("gradient"),
  glowColor: text("glow_color"),
  shapeClass: text("shape_class"),
  badge: text("badge"),
  spec: text("spec"),
});

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),         // Markdown/HTML
  imageId: text("image_id"),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  role: text("role").notNull().default("customer"),
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
}));

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
}, (table) => ({
  userIdIdx: index("addresses_user_id_idx").on(table.userId),
}));

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
  }>().notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  note: text("note"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  orderNumberIdx: index("orders_order_number_idx").on(table.orderNumber),
  statusIdx: index("orders_status_idx").on(table.status),
}));

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
}, (table) => ({
  orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
}));

export const wishlistItems = pgTable("wishlist_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userProductIdx: index("wishlist_user_product_idx").on(table.userId, table.productId),
}));

export const productReviews = pgTable("product_reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  isVerified: boolean("is_verified").default(false),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  productIdIdx: index("reviews_product_id_idx").on(table.productId),
  userIdIdx: index("reviews_user_id_idx").on(table.userId),
}));

export const promotions = pgTable("promotions", {
  id: text("id").primaryKey(),
  tag: text("tag").notNull(),
  badge: text("badge").notNull(),
  title: text("title").notNull(),
  highlight: text("highlight").notNull(),
  description: text("description").notNull(),
  code: text("code"),
  discountValue: text("discount_value"),
  minOrder: text("min_order"),
  giftText: text("gift_text"),
  ctaText: text("cta_text").default("SĂN DEAL NGAY"),
  targetUrl: text("target_url").default("/san-pham"),
  imageUrl: text("image_url").notNull(),
  originalPrice: integer("original_price"),
  salePrice: integer("sale_price"),
  floatingPerks: text("floating_perks").array(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isActiveIdx: index("promotions_is_active_idx").on(table.isActive),
  sortOrderIdx: index("promotions_sort_order_idx").on(table.sortOrder),
}));

