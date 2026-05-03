import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewService } from "@/services/review.service";
import { ReviewPayload } from "@/types";
import { PRODUCTS_KEY } from "./useProducts";

export const PRODUCT_REVIEWS_KEY = "product-reviews";

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: [PRODUCT_REVIEWS_KEY, productId],
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: !!productId,
  });
}

export function useSaveReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewPayload) => reviewService.saveReview(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_REVIEWS_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, productId] });
      toast.success("Your review has been saved.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to save review");
    },
  });
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_REVIEWS_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, productId] });
      toast.success("Review deleted successfully.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to delete review");
    },
  });
}