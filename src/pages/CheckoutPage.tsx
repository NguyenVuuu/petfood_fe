import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, MapPin, QrCode, Ticket, Truck } from "lucide-react";
import { useCartApi } from "@/hooks/useCartApi";
import { useAddresses } from "@/hooks/useAddresses";
import { orderService } from "@/services/order.service";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/axios";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totals, clear, isLoading: cartLoading } = useCartApi();
  const { data: addresses = [], isLoading: addressLoading } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "banking" | "vnpay">("cash");
  const [note, setNote] = useState("");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault) ?? addresses[0], [addresses]);
  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === (selectedAddressId || defaultAddress?.id)) ?? defaultAddress,
    [addresses, selectedAddressId, defaultAddress],
  );

  const shippingFee = totals.subtotal > 500_000 ? 0 : 30_000;
  const finalTotal = totals.subtotal + shippingFee;

  const createOrderMutation = useMutation({
    mutationFn: () => {
      if (!selectedAddress?.id) {
        throw new Error("Please select a shipping address");
      }

      return orderService.createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          name: item.productName,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          price: item.priceAtAdd,
        })),
        addressId: selectedAddress.id,
        paymentMethod,
        notes: note,
      });
    },
    onSuccess: async (order) => {
      clear();
      toast.success("Order created successfully");
      
      if (paymentMethod === "banking") {
        navigate(`/payment/upload-proof/${order._id}`);
      } else if (paymentMethod === "vnpay") {
        try {
          // Gọi API để lấy VNPay payment URL
          const { data } = await apiClient.post(`/payments/vnpay/create`, {
            orderId: order._id,
            amount: order.totalAmount,
            orderInfo: `Thanh toan don hang ${order._id}`,
          });
          
          if (data.paymentUrl) {
            // Chuyển đến trang VNPay với payment URL
            navigate(`/payment/vnpay?url=${encodeURIComponent(data.paymentUrl)}`);
          } else {
            toast.error("Failed to create VNPay payment");
            navigate(`/my-account/orders/${order._id}`);
          }
        } catch (error: any) {
          toast.error("Failed to create VNPay payment");
          navigate(`/my-account/orders/${order._id}`);
        }
      } else {
        navigate(`/my-account/orders/${order._id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to place order");
    },
  });

  if (!cartLoading && items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <MapPin size={16} className="text-amber-500" /> Shipping address
              </h2>
              <Button size="sm" variant="outline" onClick={() => setAddressDialogOpen(true)}>
                Change Address
              </Button>
            </div>

            {addressLoading && <p className="text-sm text-gray-500">Loading addresses...</p>}
            {!addressLoading && !selectedAddress && (
              <p className="text-sm text-red-500">No address found. Please add address in My Account.</p>
            )}
            {selectedAddress && (
              <div className="rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800/60">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedAddress.fullName} - {selectedAddress.phone}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedAddress.detailAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Cart items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={getImageUrl(item.imageUrl)} alt={item.productName} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{item.productName}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Ticket size={16} className="text-amber-500" /> Coupon
            </h2>
            <div className="flex gap-2">
              <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" />
              <Button variant="outline" disabled>
                Apply
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-400">Coupon integration can be wired to cart summary validation later.</p>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <CreditCard size={16} className="text-amber-500" /> Payment method
            </h2>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Truck size={16} /> Cash on Delivery
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} /> Banking Transfer
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === "banking"}
                  onChange={() => setPaymentMethod("banking")}
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} /> VNPay
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === "vnpay"}
                  onChange={() => setPaymentMethod("vnpay")}
                />
              </label>
            </div>

            {paymentMethod === "banking" && (
              <div className="mt-4 space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900/40 dark:bg-blue-900/20">
                <p className="font-semibold text-blue-700 dark:text-blue-300">Bank transfer instructions</p>
                <p className="text-blue-700/90 dark:text-blue-300/90">Bank: Vietcombank - 0123456789 - PETFOOD COMPANY</p>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-blue-700 dark:bg-gray-900 dark:text-blue-300">
                  <QrCode size={16} /> QR placeholder - scan to transfer
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Order note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-amber-400 dark:border-gray-700 dark:bg-gray-900"
                placeholder="Optional note for delivery"
              />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Order summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold dark:border-gray-800">
              <span>Total</span>
              <span className="text-amber-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" loading={createOrderMutation.isPending} onClick={() => createOrderMutation.mutate()}>
            Place order
          </Button>
        </aside>
      </div>

      <Modal isOpen={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} title="Select shipping address" size="lg">
        <div className="space-y-2">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => {
                setSelectedAddressId(address.id);
                setAddressDialogOpen(false);
              }}
              className={`w-full rounded-xl border p-3 text-left transition ${
                (selectedAddressId || defaultAddress?.id) === address.id
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white">
                {address.fullName} - {address.phone} {address.isDefault && "(Default)"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {address.detailAddress}, {address.ward}, {address.district}, {address.province}
              </p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
