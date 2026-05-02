import { Badge } from "@/components/ui/Badge";

interface StatusBadgeProps {
  type: "account" | "role" | "order" | "payment";
  value: string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  const normalized = value.toLowerCase();

  if (type === "account") {
    return (
      <Badge variant={normalized === "active" ? "success" : "danger"}>
        {normalized === "active" ? "Active" : "Inactive"}
      </Badge>
    );
  }

  if (type === "role") {
    return <Badge variant={normalized === "admin" ? "info" : "outline"}>{value}</Badge>;
  }

  if (type === "payment") {
    const variant =
      normalized === "paid"
        ? "success"
        : normalized === "failed"
          ? "danger"
          : "warning";
    return <Badge variant={variant}>{value}</Badge>;
  }

  const variant =
    normalized === "completed" || normalized === "delivered"
      ? "success"
      : normalized === "cancelled"
        ? "danger"
        : normalized === "shipping" || normalized === "shipped"
          ? "info"
          : "warning";

  return <Badge variant={variant}>{value}</Badge>;
}
