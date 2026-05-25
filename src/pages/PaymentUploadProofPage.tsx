import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, CreditCard, ImagePlus, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function PaymentUploadProofPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["payment-upload-order", orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Please select an image");
      return paymentService.uploadBankingProof(orderId, file);
    },
    onSuccess: () => {
      toast.success("Proof uploaded. Waiting for admin verification");
      navigate(`/my-account/orders/${orderId}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error?.message ?? "Upload failed");
    },
  });

  const onFileChange = (selected: File | null) => {
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : "");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Banking Transfer Proof</h1>
        <p className="mt-1 text-sm text-gray-500">Order #{orderId.slice(-8).toUpperCase()}</p>

        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <CreditCard size={16} /> Banking transfer
          </div>
          <p>Bank: Vietcombank</p>
          <p>Account: 0123456789</p>
          <p>Receiver: PETFOOD COMPANY</p>
          <p>
            Amount:{" "}
            <span className="font-bold">
              {isLoading ? "Loading..." : formatPrice(order?.totalAmount ?? 0)}
            </span>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          {!preview ? (
            <div className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <UploadCloud />
              </div>
              <p className="text-sm text-gray-500">Drag and drop image here or choose from your device</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                <ImagePlus size={15} /> Choose image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <img src={preview} alt="proof" className="mx-auto max-h-80 rounded-xl object-contain" />
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => onFileChange(null)}>
                  <X size={14} /> Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} /> Verification flow
          </div>
          After upload, payment status becomes waiting verification. Admin will approve/reject manually.
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate("/my-account/orders")}>Skip for now</Button>
          <Button disabled={!file} loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Upload proof
          </Button>
        </div>
      </div>
    </div>
  );
}
