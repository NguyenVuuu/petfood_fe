import { Badge } from "@/components/ui/Badge";

interface StatusBadgeProps {
  type: "account" | "role" | "order" | "payment";
  value: string;
}

const normalizeLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
    return <Badge variant={normalized === "admin" ? "info" : "outline"}>{normalizeLabel(value)}</Badge>;
  }

  if (type === "payment") {
    const variant =
      normalized === "paid"
        ? "success"
        : normalized === "failed"
          ? "danger"
          : normalized === "waiting_verify"
            ? "info"
            : "warning";
    return <Badge variant={variant}>{normalizeLabel(value)}</Badge>;
  }

  const variant =
    normalized === "completed" || normalized === "delivered"
      ? "success"
      : normalized === "cancelled"
        ? "danger"
        : normalized === "shipping"
          ? "info"
          : "warning";

  return <Badge variant={variant}>{normalizeLabel(value)}</Badge>;
}
