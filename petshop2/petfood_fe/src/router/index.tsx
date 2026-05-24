import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppDispatch";

import { Layout } from "@/components/layout/Layout";

// Public pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProductListPage from "@/pages/ProductListPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import WishlistPage from "@/pages/WishlistPage";
import PaymentUploadProofPage from "@/pages/PaymentUploadProofPage";

// Payment pages
import VnpayPage from "@/pages/payment/VnpayPage";
import VnpayReturnPage from "@/pages/payment/VnpayReturnPage";
import PaymentResultPage from "@/pages/payment/PaymentResultPage";

// Account pages
import AccountLayout from "@/pages/account/AccountLayout";
import ProfilePage from "@/pages/account/ProfilePage";
import SecurityPage from "@/pages/account/SecurityPage";
import AddressesPage from "@/pages/account/AddressesPage";
import OrdersPage from "@/pages/account/OrdersPage";
import OrderDetailPage from "@/pages/account/OrderDetailPage";
import CouponsPage from "@/pages/account/CouponsPage";
import AccountWishlistPage from "@/pages/account/WishlistPage";
import ShippingOrdersPage from "@/pages/account/ShippingOrdersPage";

// Admin pages
import { AdminLayout } from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductList from "@/pages/admin/AdminProductList";
import AdminProductForm from "@/pages/admin/AdminProductForm";
import AdminCategoryPage from "@/pages/admin/AdminCategoryPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import { AdminPendingOrdersPage } from "@/pages/admin/AdminOrdersPage";
import AdminBankingPaymentsPage from "@/pages/admin/AdminBankingPaymentsPage";
import AdminCouponsPage from "@/pages/admin/AdminCouponsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage";

// Admin statistics pages
import RevenueStatisticsPage from "@/pages/admin/statistics/RevenueStatisticsPage";
import OrderStatisticsPage from "@/pages/admin/statistics/OrderStatisticsPage";
import ProductStatisticsPage from "@/pages/admin/statistics/ProductStatisticsPage";
import UserStatisticsPage from "@/pages/admin/statistics/UserStatisticsPage";
import PaymentStatisticsPage from "@/pages/admin/statistics/PaymentStatisticsPage";
import CouponStatisticsPage from "@/pages/admin/statistics/CouponStatisticsPage";

// Guards
function RequireAuth() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

function GuestOnly() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  // Main layout routes
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/products", element: <ProductListPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/cart", element: <CartPage /> },

      // Guest-only routes
      {
        element: <GuestOnly />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },

      // Auth-required routes
      {
        element: <RequireAuth />,
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/wishlist", element: <WishlistPage /> },
          { path: "/payment/upload-proof/:orderId", element: <PaymentUploadProofPage /> },

          // Account section
          {
            path: "/account",
            element: <AccountLayout />,
            children: [
              { index: true, element: <Navigate to="/account/profile" replace /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "security", element: <SecurityPage /> },
              { path: "addresses", element: <AddressesPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "orders/:id", element: <OrderDetailPage /> },
              { path: "coupons", element: <CouponsPage /> },
              { path: "wishlist", element: <AccountWishlistPage /> },
              { path: "shipping-orders", element: <ShippingOrdersPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Payment pages (outside main layout)
  {
    element: <RequireAuth />,
    children: [
      { path: "/payment/vnpay", element: <VnpayPage /> },
      { path: "/payment/vnpay-return", element: <VnpayReturnPage /> },
      { path: "/payment/result", element: <PaymentResultPage /> },
    ],
  },

  // Admin routes
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProductList /> },
          { path: "products/new", element: <AdminProductForm /> },
          { path: "products/:id/edit", element: <AdminProductForm /> },
          { path: "categories", element: <AdminCategoryPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "orders/pending", element: <AdminPendingOrdersPage /> },
          { path: "payments/banking", element: <AdminBankingPaymentsPage /> },
          { path: "coupons", element: <AdminCouponsPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "reviews", element: <AdminReviewsPage /> },
          { path: "statistics/revenue", element: <RevenueStatisticsPage /> },
          { path: "statistics/orders", element: <OrderStatisticsPage /> },
          { path: "statistics/products", element: <ProductStatisticsPage /> },
          { path: "statistics/users", element: <UserStatisticsPage /> },
          { path: "statistics/payments", element: <PaymentStatisticsPage /> },
          { path: "statistics/coupons", element: <CouponStatisticsPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);
