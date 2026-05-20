import apiClient from "@/lib/axios";
import { Payment } from "@/types";

export const paymentService = {
  async uploadBankingProof(orderId: string, file: File): Promise<Payment> {
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("file", file);

    const { data } = await apiClient.post<{ success: boolean; payment: Payment }>(
      "/payments/banking/upload-proof",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return data.payment;
  },

  async getPendingBankingPayments(params?: { page?: number; limit?: number }): Promise<{ payments: Payment[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { data } = await apiClient.get("/payments/admin/payments/banking/pending", {
      params,
    });
    return data;
  },

  async approvePayment(id: string): Promise<Payment> {
    const { data } = await apiClient.patch<{ success: boolean; payment: Payment }>(`/payments/admin/payments/${id}/approve`);
    return data.payment;
  },

  async rejectPayment(id: string, rejectedReason: string): Promise<Payment> {
    const { data } = await apiClient.patch<{ success: boolean; payment: Payment }>(`/payments/admin/payments/${id}/reject`, {
      rejectedReason,
    });
    return data.payment;
  },
};
