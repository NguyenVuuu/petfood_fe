import apiClient from "@/lib/axios";
import { Order, OrderItem, ShippingAddress } from "@/types";

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "bank_transfer" | "momo";
}

export interface OrderListResponse {
  orders: Order[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type AdminOrderStatus =
  | "WAITING_FOR_PROCESSING"
  | "PROCESSING"
  | "WAITING_FOR_DELIVERY"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.post<{ order: Order }>("/orders", payload);
    return data.order;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<{ orders: Order[] }>("/orders/my-orders");
    return data.orders;
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await apiClient.get<{ order: Order }>(`/orders/${id}`);
    return data.order;
  },

  async markDeliveryPopupSeen(id: string): Promise<Order> {
    const { data } = await apiClient.patch<{ order: Order }>(
      `/orders/${id}/delivery-popup-seen`,
    );
    return data.order;
  },

  async getAdminOrders(params?: {
    orderStatus?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<OrderListResponse> {
    const { data } = await apiClient.get<OrderListResponse>("/admin/orders", { params });
    return data;
  },

  async getWaitingForProcessing(): Promise<OrderListResponse> {
    const { data } = await apiClient.get<OrderListResponse>(
      "/admin/orders/waiting-processing",
    );
    return data;
  },

  async updateDeliveryTime(id: string, deliveryEstimatedTime: string): Promise<Order> {
    const { data } = await apiClient.patch<{ order: Order }>(
      `/admin/orders/${id}/delivery-time`,
      { deliveryEstimatedTime },
    );
    return data.order;
  },

  async updateAdminStatus(
    id: string,
    orderStatus: AdminOrderStatus,
    reason = "",
  ): Promise<Order> {
    const { data } = await apiClient.patch<{ order: Order }>(
      `/admin/orders/${id}/status`,
      { orderStatus, reason },
    );
    return data.order;
  },

  async simulatePaymentSucceeded(id: string): Promise<Order> {
    const { data } = await apiClient.post<{ order: Order }>(
      "/orders/events/payment-succeeded",
      {
        eventId: `manual-${id}-${Date.now()}`,
        orderId: id,
        paymentId: "507f1f77bcf86cd799439011",
      },
    );
    return data.order;
  },
};
