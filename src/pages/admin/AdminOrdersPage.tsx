import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, PackageCheck, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/account/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { AdminOrderStatus, Order, orderService } from "@/services/order.service";

const fmt = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not set";

const statusOptions: AdminOrderStatus[] = [
  "WAITING_FOR_PROCESSING",
  "PROCESSING",
  "WAITING_FOR_DELIVERY",
  "DELIVERING",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const label = (value?: string) =>
  (value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function DeliveryTimeForm({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      orderService.updateDeliveryTime(
        order._id,
        new Date(value).toISOString(),
      ),
    onSuccess: () => {
      toast.success("Delivery time updated.");
      setValue("");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to update delivery time");
    },
  });

  return (
    <div className="flex min-w-[260px] items-center gap-2">
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!value}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Set
      </Button>
    </div>
  );
}

function StatusControl({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<AdminOrderStatus>(
    (order.orderStatus as AdminOrderStatus) || "WAITING_FOR_PROCESSING",
  );

  const mutation = useMutation({
    mutationFn: () => orderService.updateAdminStatus(order._id, nextStatus),
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Invalid status transition");
    },
  });

  return (
    <div className="flex items-center gap-2">
      <select
        value={nextStatus}
        onChange={(event) => setNextStatus(event.target.value as AdminOrderStatus)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {label(status)}
          </option>
        ))}
      </select>
      <Button
        type="button"
        size="sm"
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Update
      </Button>
    </div>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"waiting" | "all">("waiting");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", tab],
    queryFn: () =>
      tab === "waiting"
        ? orderService.getWaitingForProcessing()
        : orderService.getAdminOrders({ limit: 50 }),
  });

  const simulatePaymentMutation = useMutation({
    mutationFn: (orderId: string) => orderService.simulatePaymentSucceeded(orderId),
    onSuccess: () => {
      toast.success("PaymentSucceeded event handled.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to simulate payment");
    },
  });

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
          <div className="rounded-2xl bg-teal-100 p-3 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
            <PackageCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage paid orders, delivery time, and delivery status.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })}
        >
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("waiting")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === "waiting"
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          Waiting Processing
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === "all"
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          All Orders
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <CalendarClock size={16} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {tab === "waiting" ? "Paid orders waiting for processing" : "All orders"}
          </h2>
          <Badge variant="outline">{orders.length}</Badge>
        </div>

        {isLoading && (
          <div className="p-6 text-sm text-gray-500">Loading orders...</div>
        )}

        {isError && (
          <div className="p-6 text-sm text-red-500">Cannot load orders.</div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="p-6 text-sm text-gray-500">No orders in this view.</div>
        )}

        {orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Estimated Delivery</th>
                  <th className="px-5 py-3">Delivery Time</th>
                  <th className="px-5 py-3">Update Status</th>
                  <th className="px-5 py-3">Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-5 py-4">
                      <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">{fmt(order.createdAt)}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-amber-500">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge type="payment" value={order.paymentStatus ?? "PENDING"} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge type="order" value={label(order.orderStatus ?? order.status)} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {fmt(order.deliveryEstimatedTime)}
                    </td>
                    <td className="px-5 py-4">
                      <DeliveryTimeForm order={order} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusControl order={order} />
                    </td>
                    <td className="px-5 py-4">
                      {order.paymentStatus === "PENDING" ||
                      order.paymentStatus === "pending" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          loading={simulatePaymentMutation.isPending}
                          onClick={() => simulatePaymentMutation.mutate(order._id)}
                        >
                          Mark paid
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
