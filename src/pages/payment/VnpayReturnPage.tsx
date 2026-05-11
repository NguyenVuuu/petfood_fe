import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import apiClient from "@/lib/axios";

/**
 * VNPay redirects browser to http://localhost:5173/payment/vnpay-return?vnp_*=...
 * This page verifies payment, then broadcasts result via localStorage
 * so the original tab (VnpayPage) can react and redirect.
 */
export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const verify = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const { data } = await apiClient.get("/payments/vnpay/verify", { params });

        if (data.status === "PAID") {
          setStatus("success");
          // Broadcast to all tabs (including the original VnpayPage tab)
          localStorage.setItem("vnpay_result", JSON.stringify({
            status: "success",
            orderId: data.orderId,
            txnRef: data.txnRef,
            ts: Date.now(),
          }));
        } else {
          setStatus("failed");
          localStorage.setItem("vnpay_result", JSON.stringify({
            status: "failed",
            orderId: data.orderId,
            code: params.vnp_ResponseCode,
            ts: Date.now(),
          }));
        }

        // Close this tab after a short delay
        setTimeout(() => window.close(), 1500);
      } catch {
        setStatus("failed");
        localStorage.setItem("vnpay_result", JSON.stringify({
          status: "failed",
          ts: Date.now(),
        }));
        setTimeout(() => window.close(), 1500);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950">
      {status === "loading" && (
        <>
          <Loader2 size={40} className="animate-spin text-amber-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Đang xác nhận thanh toán...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle size={48} className="text-emerald-500" />
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Thanh toán thành công!</p>
          <p className="text-xs text-gray-400">Tab này sẽ tự đóng...</p>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle size={48} className="text-red-500" />
          <p className="font-semibold text-red-500">Thanh toán thất bại.</p>
          <p className="text-xs text-gray-400">Tab này sẽ tự đóng...</p>
        </>
      )}
    </div>
  );
}
