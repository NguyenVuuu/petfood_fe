import apiClient from "@/lib/axios";

export type StatisticsFilter = {
  range?: "today" | "7days" | "month" | "custom";
  startDate?: string;
  endDate?: string;
};

const buildParams = (filter: StatisticsFilter = {}) => {
  if (filter.range === "custom") {
    return {
      startDate: filter.startDate,
      endDate: filter.endDate,
    };
  }
  return {
    range: filter.range || "today",
  };
};

const getStatistics = async <T>(path: string, filter?: StatisticsFilter): Promise<T> => {
  const { data } = await apiClient.get<{ success: boolean; data: T }>(path, {
    params: buildParams(filter),
  });
  return data.data;
};

export const statisticsApi = {
  getRevenueStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/revenue", filter),
  getOrderStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/orders", filter),
  getProductStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/products", filter),
  getPaymentStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/payments", filter),
  getCouponStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/coupons", filter),
  getUserStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/users", filter),
  getDashboardStatistics: <T>(filter?: StatisticsFilter) =>
    getStatistics<T>("/admin/statistics/dashboard", filter),
};
