# PawMart — API Reference (Frontend)

Base URL: `http://localhost:3000/api` (cấu hình qua `VITE_API_BASE_URL`)

Tất cả request đi qua **api-gateway**. Token được tự động đính kèm bởi axios interceptor (`src/lib/axios.ts`).

---

## Auth

> Không cần header thêm. Token trả về lưu vào `localStorage["accessToken"]`.

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/auth/register` | `{ fullName, email, password }` | `{ message, accessToken, user }` |
| `POST` | `/auth/login` | `{ email, password }` | `{ message, accessToken, user }` |
| `POST` | `/auth/logout` | — | `200` |
| `POST` | `/auth/refresh` | — (dùng cookie) | `{ accessToken }` |
| `GET`  | `/auth/me` | — | `{ user }` |

**User shape:**
```ts
{ _id, fullName, email, role: "user" | "admin", createdAt }
```

---

## Products

> Không cần auth để đọc. Cần `Bearer token` để tạo/sửa/xóa (admin).

| Method | Endpoint | Params / Body | Response |
|--------|----------|---------------|----------|
| `GET` | `/products` | query params bên dưới | `{ items: Product[], meta }` |
| `GET` | `/products/:id` | — | `{ product }` |
| `POST` | `/products` | `FormData` (admin) | `{ message, product }` |
| `PUT` | `/products/:id` | `FormData` (admin) | `{ message, product }` |
| `DELETE` | `/products/:id` | — (admin) | `{ message, product }` |

**Query params cho `GET /products`:**
```
page?       number   default 1
limit?      number   default 10
keyword?    string   tìm theo tên
sortBy?     "createdAt" | "updatedAt" | "name" | "price"
sortOrder?  "asc" | "desc"
```

**Product shape:**
```ts
{
  _id, name, slug, description, price, stock,
  categoryId: string | null,
  imageUrl, imageKey, isActive,
  rating?, reviewCount?,
  createdAt, updatedAt
}
```

**Meta shape:**
```ts
{ page, limit, total, totalPages }
```

---

## Cart

> Hỗ trợ **user** (Bearer token) và **guest** (`x-cart-token` header).  
> Frontend tự xử lý qua `src/services/cart.service.ts` — không cần set header thủ công.

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `GET` | `/cart` | — | `{ cart }` |
| `POST` | `/cart/items` | `{ productId, quantity }` | `{ message, cart }` |
| `PATCH` | `/cart/items/:productId` | `{ quantity }` | `{ message, cart }` |
| `DELETE` | `/cart/items/:productId` | — | `{ message, cart }` |
| `DELETE` | `/cart` | — | `{ message, cart }` |
| `POST` | `/cart/validate` | — | `{ canCheckout, issues, cart }` |
| `POST` | `/cart/merge` | `{ guestToken }` | `{ message, cart }` (cần Bearer) |

**Cart shape:**
```ts
{
  id, ownerType: "user" | "guest",
  items: CartApiItem[],
  totals: { subtotal, totalItems },
  createdAt, updatedAt
}
```

**CartApiItem shape:**
```ts
{
  productId, quantity,
  priceAtAdd,       // giá lúc thêm vào giỏ
  productName, imageUrl,
  lastValidatedAt: string | null,
  flags: {
    priceChanged,   // giá đã thay đổi so với lúc thêm
    outOfStock,     // hết hàng hoặc không đủ số lượng
    inactiveProduct // sản phẩm bị ẩn/xóa
  }
}
```

**Validate response:**
```ts
{
  canCheckout: boolean,
  issues: Array<{ productId, issues: string[] }>,
  cart: Cart
}
```

> **Lưu ý:** Gọi `POST /cart/validate` trước khi cho phép checkout. Nếu `canCheckout = false`, hiển thị cảnh báo theo `flags` trên từng item.

---

## Categories

> Không cần auth.

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/categories` | `{ categories: Category[] }` |
| `GET` | `/categories/:id` | `{ category }` |

**Category shape:**
```ts
{ _id, name, slug, description?, imageUrl?, createdAt }
```

---

## Orders

> Cần `Bearer token`.

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/orders` | payload bên dưới | `{ order }` |
| `GET` | `/orders/me` | — | `{ orders: Order[] }` |
| `GET` | `/orders/:id` | — | `{ order }` |

**Create order body:**
```ts
{
  items: Array<{ productId, name, price, quantity, imageUrl }>,
  shippingAddress: { fullName, phone, address, city, note? },
  paymentMethod: "cod" | "bank_transfer" | "momo"
}
```

**Order shape:**
```ts
{
  _id, userId, items, shippingAddress,
  totalAmount,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  paymentMethod: "cod" | "bank_transfer" | "momo",
  createdAt
}
```

---

## Lỗi thường gặp

| Status | Ý nghĩa |
|--------|---------|
| `400` | Validation failed / thiếu field |
| `400` | `Missing cart identity` — không có Bearer và không có `x-cart-token` |
| `401` | Token hết hạn hoặc không hợp lệ |
| `404` | Resource không tồn tại |
| `502` | Service downstream đang tắt |

---

## Hooks sẵn có

Dùng trực tiếp thay vì gọi service thủ công:

```ts
useProducts(params)     // GET /products
useProduct(id)          // GET /products/:id
useCartApi()            // toàn bộ cart operations
useAuth()               // login / register / logout
```

Xem chi tiết tại `src/hooks/`.
