import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreateCouponPayload, CouponScope, CouponType } from "@/types/coupon";

interface CreateCouponModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCouponPayload) => void;
}

const EMPTY: CreateCouponPayload = {
  code: "",
  description: "",
  type: "percentage",
  discountValue: 0,
  minOrderAmount: 0,
  scope: "global",
  expiresAt: "",
  usageLimit: null,
};

export function CreateCouponModal({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: CreateCouponModalProps) {
  const [form, setForm] = useState<CreateCouponPayload>(EMPTY);

  const set = <K extends keyof CreateCouponPayload>(
    key: K,
    value: CreateCouponPayload[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    setForm(EMPTY);
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      code: form.code.toUpperCase().trim(),
      // Convert local datetime to ISO
      expiresAt: new Date(form.expiresAt).toISOString(),
    });
  };

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const selectClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Coupon" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Code *</label>
            <Input
              placeholder="e.g. SALE20"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Scope</label>
            <select
              className={selectClass}
              value={form.scope}
              onChange={(e) => set("scope", e.target.value as CouponScope)}
            >
              <option value="global">Global</option>
              <option value="user">User-specific</option>
              <option value="birthday">Birthday</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <Input
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type *</label>
            <select
              className={selectClass}
              value={form.type}
              onChange={(e) => set("type", e.target.value as CouponType)}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount (đ)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {form.type === "percentage" ? "Discount (%)" : "Discount (đ)"} *
            </label>
            <Input
              type="number"
              min={0}
              max={form.type === "percentage" ? 100 : undefined}
              placeholder="0"
              value={form.discountValue || ""}
              onChange={(e) => set("discountValue", Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Order Amount (đ)</label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={form.minOrderAmount || ""}
              onChange={(e) => set("minOrderAmount", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Usage Limit (blank = unlimited)</label>
            <Input
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                set("usageLimit", e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Expiration Date *</label>
          <Input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => set("expiresAt", e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!form.code || !form.expiresAt}>
            Create Coupon
          </Button>
        </div>
      </form>
    </Modal>
  );
}
