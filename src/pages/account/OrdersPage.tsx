import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { BellRing, ChevronRight, Package, Truck } from "lucide-react";
import { orderService } from "@/services/order.service";
import { Order } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/account/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const fmt = (v: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));

const paymentLabel: Record<string, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  waiting_verify: "Waiting verify",
  paid: "Paid",
  failed: "Failed",
};

const orderLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

function useCountdown(target?: string | null) {
  if (!target) return "";
  const diff = dayjs(target).diff(dayjs(), "second");
  if (diff <= 0) return "Arriving now";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export default function OrdersPage({
  onlyShipping = false,
  title = "My Orders",
  icon = <Package size={18} />,
  emptyIcon = <Package size={30} />,
}: {
  onlyShipping?: boolean;
  title?: string;
  icon?: React.ReactNode;
  emptyIcon?: React.ReactNode;
}) {
  const [arrivalDialogOpen, setArrivalDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [onlyShipping ? "orders-shipping" : "orders-all"],
    queryFn: () => (onlyShipping ? orderService.getMyShippingOrders() : orderService.getMyOrders()),
  });

  const orders = data ?? [];

  const reachedAnyCountdown = useMemo(
    () =>
      orders.some(
        (o: Order) =>
          o.orderStatus === "shipping" &&
          o.estimatedDeliveryAt &&
          dayjs(o.estimatedDeliveryAt).isBefore(dayjs()),
      ),
    [orders],
  );

  if (reachedAnyCountdown && !arrivalDialogOpen) {
    setTimeout(() => setArrivalDialogOpen(true), 0);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Cannot load orders" description="Please try again later" />;
  }

  if (!orders.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={onlyShipping ? "No shipping orders" : "No orders yet"}
        description={onlyShipping ? "Orders in shipping state will appear here" : "Start shopping to create your first order"}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          {icon}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>

        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{fmt(order.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge type="payment" value={paymentLabel[order.paymentStatus] ?? order.paymentStatus} />
                  <StatusBadge type="order" value={orderLabel[order.orderStatus] ?? order.orderStatus} />
                </div>
              </div>

              <div className="space-y-2">
                {order.items.slice(0, 2).map((item) => (
                  <div key={`${order._id}-${item.productId}`} className="flex items-center justify-between text-sm">
                    <p className="line-clamp-1 text-gray-700 dark:text-gray-300">{item.name} x{item.quantity}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Payment:</span> {order.paymentMethod === "cash" ? "Cash on Delivery" : "Banking Transfer"}
                  {order.orderStatus === "shipping" && order.estimatedDeliveryAt && (
                    <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      <Truck size={12} /> ETA {useCountdown(order.estimatedDeliveryAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-amber-600">{formatPrice(order.totalAmount)}</p>
                  <Link
                    to={`/my-account/orders/${order._id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    View <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={arrivalDialogOpen} onClose={() => setArrivalDialogOpen(false)} title="Your order has arrived" size="md">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <BellRing />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Delivery ETA has reached zero. Please check your package and enjoy your pet products.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => setArrivalDialogOpen(false)}>Great</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
