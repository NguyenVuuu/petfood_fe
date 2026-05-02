// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  isActive?: boolean;
  inactiveReason?: string | null;
  inactiveAt?: string | null;
  lastLoginAt?: string | null;
  reactivationRequestedAt?: string | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  email?: string;
  status?: "active" | "inactive";
}

export interface UserListResponse {
  items: User[];
  meta: ProductListMeta;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface InactiveLoginResponse {
  message: "Your account is inactive" | string;
  reason: string;
  canRequestReactivation: boolean;
  userId: string;
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
  _id: string; // /categories/tree returns Mongo _id and also mirrors it to id
  id: string; // backend toDto() trả về "id" không phải "_id"
  name: string;
  description?: string;
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
  description?: string;
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
 * NOTE: backend currently supports keyword + categoryId + paging + sorting.
 * Price range filters are still UI-only until product-service exposes them.
 */
export interface ProductListParams {
  page?: number;
  limit?: number;
  /** Maps to backend query param: ?keyword=  */
  keyword?: string;
  /** Maps to backend query param: ?categoryId= */
  categoryId?: string;
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
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
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
