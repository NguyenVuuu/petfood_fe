import apiClient from "@/lib/axios";
import { Order, OrderItem, ShippingAddress } from "@/types";

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "bank_transfer" | "momo";
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.post<{ order: Order }>("/orders", payload);
    return data.order;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<{ orders: Order[] }>("/orders/me");
    return data.orders;
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await apiClient.get<{ order: Order }>(`/orders/${id}`);
    return data.order;
  },
};
