import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Coupon, UserCouponStatus } from "@/types/coupon";

// For admin table — based on coupon fields
export function CouponAdminBadge({ coupon }: { coupon: Coupon }) {
  const isExpired = new Date(coupon.expiresAt) <= new Date();

  if (!coupon.isActive) {
    return (
      <Badge variant="danger" className="gap-1.5">
        <XCircle size={11} />
        Disabled
      </Badge>
    );
  }
  if (isExpired) {
    return (
      <Badge variant="default" className="gap-1.5">
        <Clock size={11} />
        Expired
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="gap-1.5">
      <CheckCircle2 size={11} />
      Active
    </Badge>
  );
}

// For user coupon card — based on UserCoupon.status
export function CouponUserBadge({ status }: { status: UserCouponStatus }) {
  if (status === "used") {
    return (
      <Badge variant="info" className="gap-1.5">
        <CheckCircle2 size={11} />
        Used
      </Badge>
    );
  }
  if (status === "expired") {
    return (
      <Badge variant="default" className="gap-1.5">
        <Clock size={11} />
        Expired
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="gap-1.5">
      <CheckCircle2 size={11} />
      Active
    </Badge>
  );
}
