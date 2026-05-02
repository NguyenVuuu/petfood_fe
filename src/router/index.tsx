import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/pages/admin/AdminLayout";

// ─── Lazy page imports ────────────────────────────────────────────────────────
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProductListPage = lazy(() => import("@/pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const AccountLayout = lazy(() => import("@/pages/account/AccountLayout"));
const AccountProfilePage = lazy(() => import("@/pages/account/ProfilePage"));
const AccountWishlistPage = lazy(() => import("@/pages/account/WishlistPage"));
const AccountOrdersPage = lazy(() => import("@/pages/account/OrdersPage"));
const AccountOrderDetailPage = lazy(
  () => import("@/pages/account/OrderDetailPage"),
);
const AccountSecurityPage = lazy(() => import("@/pages/account/SecurityPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProductForm = lazy(() => import("@/pages/admin/AdminProductForm"));
const AdminCategoryPage = lazy(() => import("@/pages/admin/AdminCategoryPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));

// ─── Page loader ─────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ─── Protected route (auth) ───────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Protected route (admin) ─────────────────────────────────────────────────
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const raw = localStorage.getItem("authUser");
  const user = raw ? JSON.parse(raw) : null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <S>
            <HomePage />
          </S>
        ),
      },
      {
        path: "products",
        element: (
          <S>
            <ProductListPage />
          </S>
        ),
      },
      {
        path: "products/:id",
        element: (
          <S>
            <ProductDetailPage />
          </S>
        ),
      },
      {
        path: "cart",
        element: (
          <S>
            <CartPage />
          </S>
        ),
      },
      {
        path: "wishlist",
        element: (
          <S>
            <WishlistPage />
          </S>
        ),
      },
      {
        path: "checkout",
        element: (
          <RequireAuth>
            <S>
              <CheckoutPage />
            </S>
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <S>
        <LoginPage />
      </S>
    ),
  },
  {
    path: "/register",
    element: (
      <S>
        <RegisterPage />
      </S>
    ),
  },
  {
    path: "/account",
    element: (
      <RequireAuth>
        <S>
          <AccountLayout />
        </S>
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/account/profile" replace />,
      },
      {
        path: "profile",
        element: (
          <S>
            <AccountProfilePage />
          </S>
        ),
      },
      {
        path: "wishlist",
        element: (
          <S>
            <AccountWishlistPage />
          </S>
        ),
      },
      {
        path: "orders",
        element: (
          <S>
            <AccountOrdersPage />
          </S>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <S>
            <AccountOrderDetailPage />
          </S>
        ),
      },
      {
        path: "security",
        element: (
          <S>
            <AccountSecurityPage />
          </S>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      {
        index: true,
        element: (
          <S>
            <AdminDashboard />
          </S>
        ),
      },
      {
        path: "categories",
        element: (
          <S>
            <AdminCategoryPage />
          </S>
        ),
      },
      {
        path: "products",
        element: <Navigate to="/admin/categories" replace />,
      },
      {
        path: "products/new",
        element: (
          <S>
            <AdminProductForm />
          </S>
        ),
      },
      {
        path: "products/:id/edit",
        element: (
          <S>
            <AdminProductForm />
          </S>
        ),
      },
      {
        path: "orders",
        element: (
          <S>
            <AdminOrdersPage />
          </S>
        ),
      },
      {
        path: "users",
        element: (
          <S>
            <AdminUsersPage />
          </S>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
