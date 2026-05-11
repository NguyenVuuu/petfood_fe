import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ExternalLink, ArrowLeft, QrCode } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CART_KEY } from "@/hooks/useCartApi";
import { cartService } from "@/services/cart.service";

export default function VnpayPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const paymentUrl = searchParams.get("paymentUrl") || "";
  const didOpen = useRef(false);

  // Auto-open VNPay payment page when this page loads
  useEffect(() => {
    if (!paymentUrl || didOpen.current) return;
    didOpen.current = true;
    window.open(paymentUrl, "_blank", "noopener,noreferrer");
  }, [paymentUrl]);

  // Listen for payment result broadcast from VnpayReturnPage via localStorage
  useEffect(() => {
    const handleStorage = async (e: StorageEvent) => {
      if (e.key !== "vnpay_result" || !e.newValue) return;

      try {
        const result = JSON.parse(e.newValue) as {
          status: "success" | "failed";
          orderId?: string;
          txnRef?: string;
          code?: string;
          ts: number;
        };

        // Ignore stale events (older than 30s)
        if (Date.now() - result.ts > 30_000) return;

        // Clean up localStorage
        localStorage.removeItem("vnpay_result");

        if (result.status === "success") {
          // Clear cart via React Query (updates cache + calls API)
          try {
            await cartService.clearCart();
            queryClient.setQueryData([CART_KEY], { items: [], totals: { subtotal: 0, totalItems: 0 } });
          } catch { /* silent */ }

          navigate(
            `/payment/result?status=success&orderId=${result.orderId}&txnRef=${result.txnRef}`,
            { replace: true }
          );
        } else {
          navigate(
            `/payment/result?status=failed&orderId=${result.orderId ?? ""}&code=${result.code ?? ""}`,
            { replace: true }
          );
        }
      } catch { /* ignore parse errors */ }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate, queryClient]);

  if (!paymentUrl) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Invalid payment session.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 md:px-6">
      <Link
        to="/account/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-500 dark:text-gray-400"
      >
        <ArrowLeft size={14} /> Xem đơn hàng của tôi
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="rounded-xl bg-amber-500 p-2 text-white">
            <QrCode size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">Thanh toán VNPay</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trang thanh toán VNPay đã được mở tự động
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="rounded-full bg-amber-50 p-5 dark:bg-amber-900/20">
            <ExternalLink size={32} className="text-amber-500" />
          </div>

          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Trang thanh toán VNPay đã mở
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Hoàn tất thanh toán trên trang VNPay.
              <br />
              Trang này sẽ tự động cập nhật sau khi thanh toán xong.
            </p>
          </div>

          {/* Re-open button in case popup was blocked */}
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-amber-600 active:scale-95"
          >
            <ExternalLink size={15} />
            Mở lại trang thanh toán
          </a>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Nếu trang không tự mở, nhấn nút trên để mở lại.
          </p>
        </div>
      </div>
    </div>
  );
}
