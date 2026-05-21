import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, Package, Star, Truck } from "lucide-react";
import { orderService } from "@/services/order.service";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/account/StatusBadge";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ReviewDialog } from "@/components/review/ReviewDialog";
import { useProductReviews } from "@/hooks/useReviews";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { Order, OrderItem, Review } from "@/types";

const fmt = (v?: string | null) =>
  v
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(new Date(v))
    : "-";

function OrderItemReviewAction({ order, item }: { order: Order; item: OrderItem }) {
  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = user?.id ?? user?._id ?? "";
  const [isOpen, setIsOpen] = useState(false);
  const canReview = order.orderStatus === "completed" && order.paymentStatus === "paid";
  const { data } = useProductReviews(canReview ? item.productId : "");

  const existingReview = useMemo<Review | null>(() => {
    if (!currentUserId) return null;
    return (
      data?.reviews?.find(
        (review) =>
          review.orderId === order._id &&
          review.productId === item.productId &&
          review.userId === currentUserId,
      ) ?? null
    );
  }, [currentUserId, data?.reviews, item.productId, order._id]);

  if (!canReview) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={existingReview ? "outline" : "primary"}
        onClick={() => setIsOpen(true)}
      >
        {existingReview ? <CheckCircle2 size={14} /> : <Star size={14} />}
        {existingReview ? "Edit Review" : "Write Review"}
      </Button>
      <ReviewDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={item.productId}
        orderId={order._id}
        productName={item.name}
        imageUrl={item.imageUrl}
        initialReview={existingReview}
      />
    </>
  );
}

export default function OrderDetailPage() {
  const { id = "" } = useParams();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return <EmptyState title="Order not found" description="Please check your order list" />;
  }

  return (
    <div className="space-y-4">
      <Link to="/my-account/orders" className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-500">Created: {fmt(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge type="payment" value={order.paymentStatus} />
            <StatusBadge type="order" value={order.orderStatus} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <Package size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Order items</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 px-5 py-4">
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <div className="mt-2">
                      <OrderItemReviewAction order={order} item={item} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.price)}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-4 text-right dark:border-gray-800">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={15} className="text-amber-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Shipping address</h4>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingAddress.phone}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {order.shippingAddress.detailAddress}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-2 flex items-center gap-2">
              <CreditCard size={15} className="text-amber-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Payment info</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Method: {order.paymentMethod === "cash" ? "Cash on Delivery" : "Banking transfer"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Status: {order.paymentStatus}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-2 flex items-center gap-2">
              <Truck size={15} className="text-amber-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Timeline</h4>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>Confirmed: {fmt(order.confirmedAt)}</li>
              <li>Shipping started: {fmt(order.shippingStartedAt)}</li>
              <li>Estimated delivery: {fmt(order.estimatedDeliveryAt)}</li>
              <li>Delivered: {fmt(order.deliveredAt)}</li>
              <li>Completed: {fmt(order.completedAt)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
