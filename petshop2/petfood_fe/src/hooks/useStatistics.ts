import { useQuery } from "@tanstack/react-query";
import { statisticsApi, StatisticsFilter } from "@/api/statisticsApi";

export type RevenueStatistics = {
  summary: {
    totalRevenue: number;
    paidRevenue: number;
    averageOrderValue: number;
    paidOrders: number;
  };
  chart: Array<{ label: string; revenue: number; orders: number }>;
  table: Array<{ date: string; totalOrders: number; paidOrders: number; revenue: number }>;
};

export type OrderStatistics = {
  summary: Record<string, number>;
  chart: Array<{ status: string; count: number }>;
  recentOrders: Array<Record<string, any>>;
};

export type ProductStatistics = {
  summary: { totalProducts: number; lowStockProducts: number };
  topSellingProducts: Array<{
    productId: string;
    name: string;
    imageUrl: string;
    soldQuantity: number;
    revenue: number;
  }>;
  lowStockList: Array<{ productId: string; name: string; stock: number; imageUrl: string }>;
};

export type PaymentStatistics = {
  summary: Record<string, number>;
  chart: Array<{ status: string; count: number }>;
  recentPayments: Array<Record<string, any>>;
};

export type CouponStatistics = {
  summary: {
    couponsUsed: number;
    totalDiscountAmount: number;
    mostUsedCoupon: string | null;
  };
  chart: Array<{ code: string; usedCount: number; totalDiscountAmount: number }>;
  table: Array<Record<string, any>>;
};

export type UserStatistics = {
  summary: Record<string, number>;
  chart: Array<{ label: string; newUsers: number }>;
  recentUsers: Array<Record<string, any>>;
};

export type DashboardStatistics = {
  revenueToday: number;
  pendingOrders: number;
  waitingVerifyPayments?: number;
  newUsers?: number;
  quickLinks: string[];
};

const queryOptions = <T>(
  key: string,
  filter: StatisticsFilter,
  fn: (filter: StatisticsFilter) => Promise<T>,
) => ({
  queryKey: ["statistics", key, filter],
  queryFn: () => fn(filter),
  staleTime: 30_000,
});

export const useRevenueStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("revenue", filter, statisticsApi.getRevenueStatistics<RevenueStatistics>));

export const useOrderStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("orders", filter, statisticsApi.getOrderStatistics<OrderStatistics>));

export const useProductStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("products", filter, statisticsApi.getProductStatistics<ProductStatistics>));

export const usePaymentStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("payments", filter, statisticsApi.getPaymentStatistics<PaymentStatistics>));

export const useCouponStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("coupons", filter, statisticsApi.getCouponStatistics<CouponStatistics>));

export const useUserStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("users", filter, statisticsApi.getUserStatistics<UserStatistics>));

export const useDashboardStatistics = (filter: StatisticsFilter) =>
  useQuery(queryOptions("dashboard", filter, statisticsApi.getDashboardStatistics<DashboardStatistics>));
