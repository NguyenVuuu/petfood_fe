// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;       // backend toDto() trả về "id" không phải "_id"
  name: string;
  slug: string;
  parentId?: string | null;
  level: number;
  path: string;
  menuGroup: string;
  menuOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
  menuGroups?: Array<{ group: string; items: CategoryNode[] }>; // chỉ có ở /menu
}

export interface CategoryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryListResponse {
  items: Category[];
  meta: CategoryListMeta;
}

export interface CategoryFormPayload {
  name: string;
  parentId?: string | null;
  menuGroup?: string;
  menuOrder?: number;
  isActive?: boolean;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string;
  imageKey: string;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query params accepted by GET /api/products (matches backend listProductSchema).
 * NOTE: categoryId / minPrice / maxPrice are NOT supported by the current
 * product-service — those fields are stripped by Joi on the server side.
 * Keep them here as UI-only state; do NOT pass them to this type for API calls.
 */
export interface ProductListParams {
  page?: number;
  limit?: number;
  /** Maps to backend query param: ?keyword=  */
  keyword?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "price";
  sortOrder?: "asc" | "desc";
}

/** Actual response shape returned by product-service listProducts */
export interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  items: Product[];
  meta: ProductListMeta;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

// ─── Cart API (cart-service) ──────────────────────────────────────────────────
export interface CartItemFlags {
  priceChanged: boolean;
  outOfStock: boolean;
  inactiveProduct: boolean;
}

export interface CartApiItem {
  productId: string;
  quantity: number;
  priceAtAdd: number;
  productName: string;
  imageUrl: string;
  lastValidatedAt: string | null;
  flags: CartItemFlags;
}

export interface CartTotals {
  subtotal: number;
  totalItems: number;
}

export interface CartApiResponse {
  id: string;
  ownerType: "user" | "guest";
  userId?: string | null;
  guestToken?: string | null;
  items: CartApiItem[];
  totals: CartTotals;
  createdAt: string;
  updatedAt: string;
}

export interface CartValidateIssue {
  productId: string;
  issues: string[];
}

export interface CartValidateResponse {
  canCheckout: boolean;
  issues: CartValidateIssue[];
  cart: CartApiResponse;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cod" | "bank_transfer" | "momo";
  createdAt: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";
