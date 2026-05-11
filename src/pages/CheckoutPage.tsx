import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ArrowLeft, CreditCard, Truck, Banknote, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  note: z.string().optional(),
  paymentMethod: z.enum(["cod", "bank_transfer", "momo"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS = [
  { id: "cod" as const, label: "Cash on Delivery", icon: <Truck size={16} />, desc: "Pay when you receive" },
  { id: "bank_transfer" as const, label: "VNPay QR", icon: <QrCode size={16} />, desc: "Scan QR to pay via VNPay" },
  { id: "momo" as const, label: "MoMo Wallet", icon: <CreditCard size={16} />, desc: "Pay via MoMo app" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clear } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<CheckoutFormData>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: { paymentMethod: "cod" },
    });

  const selectedPayment = watch("paymentMethod");
  const shipping = totalAmount >= 500_000 ? 0 : 30_000;

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const order = await orderService.createOrder({
        items: items.map((item) => ({
          productId: item.productId.toString(),
          name: item.productName,
          price: item.priceAtAdd,
          quantity: item.quantity,
          imageUrl: item.imageUrl || "",
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          note: data.note || "",
        },
        paymentMethod: data.paymentMethod,
      });

      // VNPay QR — redirect to payment page, do NOT clear cart yet
      if (data.paymentMethod === "bank_transfer") {
        try {
          const payment = await paymentService.createVnpayPayment(
            order._id,
            totalAmount + shipping,
          );
          navigate(`/payment/vnpay?paymentUrl=${encodeURIComponent(payment.paymentUrl)}&txnRef=${payment.txnRef}&orderId=${order._id}`);
        } catch {
          toast.error("Could not create payment. Please try again.");
        }
        return;
      }

      // COD / other — clear cart immediately
      clear();

      setOrderId(order._id);
      setIsSuccess(true);
      toast.success("Order placed successfully.");
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to place order";

      toast.error(message);
    }
  };

  if (items.length === 0 && !isSuccess) {
    navigate("/cart");
    return null;
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center md:px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Order Placed! 🎉
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Your order <span className="font-bold text-amber-500">#{orderId}</span> has been placed successfully.
          We'll deliver your pet food soon! 🐾
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/products">
            <Button size="lg" className="w-full">Continue Shopping</Button>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-amber-500 dark:text-gray-400">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Link to="/cart" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-500 dark:text-gray-400">
        <ArrowLeft size={14} /> Back to cart
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Shipping info */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-5 font-bold text-gray-900 dark:text-white">
                📦 Shipping Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
                <Input label="Phone Number" error={errors.phone?.message} {...register("phone")} />
                <div className="sm:col-span-2">
                  <Input label="Address" error={errors.address?.message} {...register("address")} />
                </div>
                <Input label="City / Province" error={errors.city?.message} {...register("city")} />
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Note (optional)
                  </label>
                  <textarea
                    {...register("note")}
                    rows={3}
                    placeholder="Any special instructions..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-5 font-bold text-gray-900 dark:text-white">
                💳 Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all",
                      selectedPayment === method.id
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                        : "border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                    )}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      selectedPayment === method.id
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                      {method.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{method.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{method.desc}</div>
                    </div>
                    {selectedPayment === method.id && (
                      <CheckCircle size={18} className="ml-auto text-amber-500" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 font-bold text-gray-900 dark:text-white">Your Order</h2>
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId.toString()} className="flex items-center gap-3">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{item.productName}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(item.priceAtAdd * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span><span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-500" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold dark:border-gray-800">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg text-amber-500">{formatPrice(totalAmount + shipping)}</span>
                </div>
              </div>
              <Button type="submit" size="lg" loading={isSubmitting} className="mt-6 w-full">
                Place Order 🐾
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
