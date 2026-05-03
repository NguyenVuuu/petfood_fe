import apiClient from "@/lib/axios";
import { Review, ReviewListResponse, ReviewPayload } from "@/types";

export const reviewService = {
  async getProductReviews(productId: string): Promise<ReviewListResponse> {
    const { data } = await apiClient.get<ReviewListResponse>(`/products/${productId}/reviews`);
    return data;
  },

  async saveReview(productId: string, payload: ReviewPayload): Promise<Review> {
    const { data } = await apiClient.post<{ message: string; review: Review }>(
      `/products/${productId}/reviews`,
      payload,
    );
    return data.review;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/products/reviews/${reviewId}`);
  },
};