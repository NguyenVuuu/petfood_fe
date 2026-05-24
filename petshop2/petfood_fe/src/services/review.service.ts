import apiClient from "@/lib/axios";
import { Review, ReviewListResponse, ReviewPayload } from "@/types";

export const reviewService = {
  async getProductReviews(
    productId: string,
    params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string },
  ): Promise<ReviewListResponse> {
    const { data } = await apiClient.get<ReviewListResponse>(`/products/${productId}/reviews`, {
      params,
    });
    return data;
  },

  async createReview(payload: ReviewPayload): Promise<Review> {
    const { data } = await apiClient.post<{ success: boolean; message: string; review: Review }>(
      `/products/${payload.productId}/reviews`,
      payload,
    );
    return data.review;
  },

  async updateReview(reviewId: string, payload: Partial<ReviewPayload>): Promise<Review> {
    const { data } = await apiClient.patch<{ success: boolean; message: string; review: Review }>(
      `/reviews/${reviewId}`,
      payload,
    );
    return data.review;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },
};
