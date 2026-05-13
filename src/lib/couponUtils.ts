import { Coupon } from "@/types/coupon";

export function formatDiscount(coupon: Pick<Coupon, "type" | "discountValue">): string {
  if (coupon.type === "percentage") return `${coupon.discountValue}%`;
  return `${coupon.discountValue.toLocaleString("vi-VN")}đ`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
