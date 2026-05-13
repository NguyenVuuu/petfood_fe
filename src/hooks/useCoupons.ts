import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { couponService } from "@/services/coupon.service";
import { AssignCouponPayload, CreateCouponPayload } from "@/types/coupon";

export const COUPONS_KEY = "coupons";
export const MY_COUPONS_KEY = "my-coupons";

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminCoupons() {
  return useQuery({
    queryKey: [COUPONS_KEY],
    queryFn: couponService.listCoupons,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) =>
      couponService.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
      toast.success("Coupon created successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to create coupon");
    },
  });
}

export function useDisableCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.disableCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
      toast.success("Coupon disabled");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to disable coupon");
    },
  });
}

export function useAssignCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignCouponPayload) =>
      couponService.assignCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
      toast.success("Coupon assigned to user");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to assign coupon");
    },
  });
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function useMyCoupons() {
  return useQuery({
    queryKey: [MY_COUPONS_KEY],
    queryFn: couponService.getMyCoupons,
  });
}
