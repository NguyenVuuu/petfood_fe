import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Package, CalendarClock, CheckCircle2, FileText, Printer, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { cartService } from "@/services/cart.service";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/account/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { CART_KEY } from "@/hooks/useCartApi";

const fmt = (v: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(new Date(v));

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  momo: "MoMo Wallet",
};

export default function AccountOrderDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["account-order", id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });

  const invoiceQuery = useQuery({
    queryKey: ["order-invoice", id],
    queryFn: () => orderService.getInvoice(id),
    enabled: !!id,
  });

  const reorderMutation = useMutation({
    mutationFn: async () => {
      const result = await orderService.reorder(id);
      for (const item of result.items) {
        await cartService.addItem(item.productId, item.quantity);
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(`${result.itemCount} item(s) added back to cart`);
      navigate("/cart");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Unable to reorder");
    },
  });

  const popupSeenMutation = useMutation({
    mutationFn: () => orderService.markDeliveryPopupSeen(id),
    onSuccess: () => {
      toast.success("Thanks for confirming delivery.");
      queryClient.invalidateQueries({ queryKey: ["account-order", id] });
      queryClient.invalidateQueries({ queryKey: ["account-orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to update delivery popup");
    },
  });

  const printInvoice = () => {
    const invoice = invoiceQuery.data;
    if (!invoice) {
      toast.error("Invoice is not ready yet");
      return;
    }

    const rows = invoice.items
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td style="text-align:right">${item.quantity}</td>
            <td style="text-align:right">${formatPrice(item.unitPrice)}</td>
            <td style="text-align:right">${formatPrice(item.lineTotal)}</td>
          </tr>
        `,
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Browser blocked the invoice window");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(invoice.invoiceNo)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            h1 { margin: 0 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            .muted { color: #6b7280; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
            .totals { margin-left: auto; width: 320px; margin-top: 24px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
            .total { font-size: 20px; font-weight: 700; border-top: 2px solid #111827; margin-top: 8px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>PawMart Invoice</h1>
          <div class="muted">${escapeHtml(invoice.invoiceNo)}</div>
          <div class="grid">
            <div>
              <h3>Customer</h3>
              <div>${escapeHtml(invoice.customer.fullName || "-")}</div>
              <div>${escapeHtml(invoice.customer.phone || "-")}</div>
            </div>
            <div>
              <h3>Shipping address</h3>
              <div>${escapeHtml(invoice.shippingAddress.address)}, ${escapeHtml(invoice.shippingAddress.city)}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal</span><span>${formatPrice(invoice.totals.subtotal)}</span></div>
            <div><span>VAT included (${Math.round(invoice.totals.vatRate * 100)}%)</span><span>${formatPrice(invoice.totals.vatAmount)}</span></div>
            <div class="total"><span>Total</span><span>${formatPrice(invoice.totals.totalAmount)}</span></div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return <EmptyState title="Order not found" description="Please check your order list and try again." />;
  }

  const toOrderLabel = (s: string) =>
    ({
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      pending_payment: "Pending Payment",
      paid: "Paid",
      waiting_for_processing: "Waiting Processing",
      waiting_for_delivery: "Waiting Delivery",
      delivering: "Delivering",
      failed: "Failed",
      refunded: "Refunded",
    }[s.toLowerCase()] ?? s);

  const shouldShowDeliveredPopup =
    order.orderStatus === "DELIVERED" && order.deliveryPopupSeen === false;

  return (
    <div className="space-y-4">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:underline"
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Order</p>
          <h2 className="font-mono text-xl font-bold text-gray-900 dark:text-white">
            #{order._id.slice(-8).toUpperCase()}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">{fmt(order.createdAt)}</p>
        </div>
        <StatusBadge type="order" value={toOrderLabel(order.orderStatus ?? order.status)} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={printInvoice} disabled={invoiceQuery.isLoading}>
            <Printer size={14} /> Print invoice
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => reorderMutation.mutate()} loading={reorderMutation.isPending}>
            <ShoppingCart size={14} /> Buy again
          </Button>
        </div>
      </div>

      {shouldShowDeliveredPopup && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 text-emerald-500" size={22} />
              <div>
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
                  Your order has been delivered successfully.
                </h3>
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  Please confirm that you have seen this delivery update.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={popupSeenMutation.isPending}
              onClick={() => popupSeenMutation.mutate()}
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <Package size={16} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Items ({order.items.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.name}
                className="h-14 w-14 rounded-xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/60x60/fef3c7/92400e?text=🐾"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-amber-500">{formatPrice(item.price)}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.price * item.quantity)} total</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>VAT included</span>
              <span>{formatPrice(invoiceQuery.data?.totals.vatAmount ?? order.vatAmount ?? 0)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Taxable amount</span>
              <span>{formatPrice(invoiceQuery.data?.totals.taxableAmount ?? order.taxableAmount ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Order Total</span>
              <span className="text-xl font-bold text-amber-500">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping + Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        {invoiceQuery.data && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Invoice</h3>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-gray-500">Invoice no</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">{invoiceQuery.data.invoiceNo}</p>
              </div>
              <div>
                <p className="text-gray-500">VAT rate</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {Math.round(invoiceQuery.data.totals.vatRate * 100)}% included
                </p>
              </div>
              <div>
                <p className="text-gray-500">VAT amount</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {formatPrice(invoiceQuery.data.totals.vatAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}</p>
            {order.shippingAddress.note && (
              <p className="italic text-gray-400">Note: {order.shippingAddress.note}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Payment</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </span>
            </div>
            {order.paymentStatus && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge type="payment" value={order.paymentStatus} />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock size={16} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Tracking</h3>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-gray-500">Current status</p>
              <div className="mt-1">
                <StatusBadge type="order" value={toOrderLabel(order.orderStatus ?? order.status)} />
              </div>
            </div>
            <div>
              <p className="text-gray-500">Estimated delivery</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {order.deliveryEstimatedTime ? fmt(order.deliveryEstimatedTime) : "Not set yet"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Delivered at</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {order.deliveredAt ? fmt(order.deliveredAt) : "Not delivered yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
