import { Ban, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CouponAdminBadge } from "./CouponStatusBadge";
import { Coupon } from "@/types/coupon";
import { formatDate, formatDiscount } from "@/lib/couponUtils";

interface CouponTableProps {
  coupons: Coupon[];
  isLoading: boolean;
  disablingId: string | null;
  onDisable: (coupon: Coupon) => void;
  onAssign: (coupon: Coupon) => void;
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function CouponTable({
  coupons,
  isLoading,
  disablingId,
  onDisable,
  onAssign,
}: CouponTableProps) {
  if (isLoading) return <TableSkeleton />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
            <th className="px-5 py-3.5">Code</th>
            <th className="px-5 py-3.5">Type</th>
            <th className="px-5 py-3.5">Value</th>
            <th className="px-5 py-3.5">Min Order</th>
            <th className="px-5 py-3.5">Expiration</th>
            <th className="px-5 py-3.5">Usage</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.expiresAt) <= new Date();
            const canDisable = coupon.isActive && !isExpired;

            return (
              <tr
                key={coupon._id}
                className="group transition-colors hover:bg-amber-50/40 dark:hover:bg-amber-900/10"
              >
                <td className="px-5 py-4">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-5 py-4 capitalize text-gray-600 dark:text-gray-400">
                  {coupon.type}
                </td>
                <td className="px-5 py-4 font-semibold text-amber-600 dark:text-amber-400">
                  {formatDiscount(coupon)}
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                  {coupon.minOrderAmount > 0
                    ? `${coupon.minOrderAmount.toLocaleString("vi-VN")}đ`
                    : "—"}
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                  {formatDate(coupon.expiresAt)}
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                  {coupon.usageLimit
                    ? `${coupon.usedCount} / ${coupon.usageLimit}`
                    : `${coupon.usedCount} / ∞`}
                </td>
                <td className="px-5 py-4">
                  <CouponAdminBadge coupon={coupon} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssign(coupon)}
                      title="Assign to user"
                    >
                      <UserPlus size={13} />
                      Assign
                    </Button>
                    {canDisable && (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={disablingId === coupon._id}
                        onClick={() => onDisable(coupon)}
                        title="Disable coupon"
                      >
                        <Ban size={13} />
                        Disable
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
