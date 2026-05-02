import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { orderService } from "@/services/order.service";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/account/StatusBadge";
import { formatPrice } from "@/lib/utils";

const fmt = (v: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));

const toPaymentLabel = (s?: string) =>
  ({ paid: "Paid", failed: "Failed", refunded: "Refunded" }[s ?? ""] ?? "Pending");

const toOrderLabel = (s: string) =>
  ({ pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" }[s] ?? s);

export default function AccountOrdersPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["account-orders"],
    queryFn: () => orderService.getMyOrders(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="Cannot load orders"
        description="Please try again in a moment."
      />
    );
  }

  if (!orders?.length) {
    return (
      <EmptyState
        icon={<ShoppingBag size={32} />}
        title="No orders yet"
        description="When you place your first order, it will appear here."
        action={<Link to="/products"><Button>Start Shopping</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Orders <span className="ml-1 text-sm font-normal text-gray-400">({orders.length})</span>
        </h2>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              {["Order", "Date", "Total", "Payment", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {orders.map((order) => (
              <tr key={order._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="px-5 py-4">
                  <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{fmt(order.createdAt)}</td>
                <td className="px-5 py-4 text-sm font-bold text-amber-500">{formatPrice(order.totalAmount)}</td>
                <td className="px-5 py-4">
                  <StatusBadge type="payment" value={toPaymentLabel(order.paymentStatus)} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge type="order" value={toOrderLabel(order.status)} />
                </td>
                <td className="px-5 py-4">
                  <Link
                    to={`/account/orders/${order._id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:underline"
                  >
                    Details <ArrowRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div key={order._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{fmt(order.createdAt)}</p>
              </div>
              <StatusBadge type="order" value={toOrderLabel(order.status)} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-amber-500">{formatPrice(order.totalAmount)}</span>
                <StatusBadge type="payment" value={toPaymentLabel(order.paymentStatus)} />
              </div>
              <Link
                to={`/account/orders/${order._id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"
              >
                Details <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
