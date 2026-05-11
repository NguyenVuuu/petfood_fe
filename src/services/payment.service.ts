import apiClient from "@/lib/axios";

export interface CreatePaymentResponse {
  paymentUrl: string;
  txnRef: string;
  paymentId: string;
}

export interface PaymentStatusResponse {
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderId: string;
  amount: number;
  txnRef: string;
  paidAt: string | null;
}

export const paymentService = {
  async createVnpayPayment(orderId: string, amount: number): Promise<CreatePaymentResponse> {
    const { data } = await apiClient.post<CreatePaymentResponse>("/payments/vnpay/create", {
      orderId,
      amount,
    });
    return data;
  },

  async getPaymentStatus(txnRef: string): Promise<PaymentStatusResponse> {
    const { data } = await apiClient.get<PaymentStatusResponse>(`/payments/status/${txnRef}`);
    return data;
  },
};
