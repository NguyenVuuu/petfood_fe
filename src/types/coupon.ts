export type CouponType = "percentage" | "fixed";
export type CouponScope = "global" | "user" | "birthday";
export type UserCouponStatus = "active" | "used" | "expired";

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: CouponType;
  discountValue: number;
  minOrderAmount: number;
  scope: CouponScope;
  expiresAt: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export interface UserCoupon {
  _id: string;
  status: UserCouponStatus;
  assignedBy: "admin" | "system";
  createdAt: string;
  // Populated coupon
  coupon: Pick<
    Coupon,
    | "_id"
    | "code"
    | "description"
    | "type"
    | "discountValue"
    | "minOrderAmount"
    | "scope"
    | "expiresAt"
    | "isActive"
  >;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  type: CouponType;
  discountValue: number;
  minOrderAmount?: number;
  scope?: CouponScope;
  expiresAt: string; // ISO string
  usageLimit?: number | null;
}

export interface AssignCouponPayload {
  couponId: string;
  userId: string;
}
