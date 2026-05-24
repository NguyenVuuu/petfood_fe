import apiClient from "@/lib/axios";
import {
  Coupon,
  UserCoupon,
  CreateCouponPayload,
  AssignCouponPayload,
  CouponValidation,
  AvailableCoupon,
} from "@/types/coupon";

export const couponService = {
  // Admin: list all coupons
  async listCoupons(): Promise<Coupon[]> {
    const { data } = await apiClient.get<{ coupons: Coupon[] }>("/coupons");
    return data.coupons;
  },

  // Admin: create coupon
  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const { data } = await apiClient.post<{ coupon: Coupon }>("/coupons", payload);
    return data.coupon;
  },

  // Admin: disable coupon
  async disableCoupon(id: string): Promise<Coupon> {
    const { data } = await apiClient.patch<{ coupon: Coupon }>(
      `/coupons/${id}/disable`
    );
    return data.coupon;
  },

  // Admin: assign coupon to user
  async assignCoupon(payload: AssignCouponPayload): Promise<void> {
    await apiClient.post("/coupons/assign", payload);
  },

  // User: get my coupons
  async getMyCoupons(): Promise<UserCoupon[]> {
    const { data } = await apiClient.get<{ coupons: UserCoupon[] }>("/coupons/my");
    return data.coupons;
  },

  async getAvailableCoupons(params: { subtotal: number; shippingFee: number }): Promise<AvailableCoupon[]> {
    const { data } = await apiClient.get<{ coupons: AvailableCoupon[] }>("/coupons/available", {
      params: {
        ...params,
        _t: Date.now(),
      },
    });
    return data.coupons;
  },

  async validateCoupon(payload: {
    code: string;
    subtotal: number;
    shippingFee: number;
  }): Promise<CouponValidation> {
    const { data } = await apiClient.post<CouponValidation>("/coupons/validate", payload);
    return data;
  },
};
