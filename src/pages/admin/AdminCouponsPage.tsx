import { useState } from "react";
import { Plus, RefreshCw, Tag } from "lucide-react";
import {
  useAdminCoupons,
  useCreateCoupon,
  useDisableCoupon,
  useAssignCoupon,
} from "@/hooks/useCoupons";
import { CouponTable } from "@/components/coupon/CouponTable";
import { CreateCouponModal } from "@/components/coupon/CreateCouponModal";
import { AssignCouponModal } from "@/components/coupon/AssignCouponModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Coupon, CreateCouponPayload } from "@/types/coupon";

export default function AdminCouponsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Coupon | null>(null);
  const [disablingId, setDisablingId] = useState<string | null>(null);

  const { data: coupons = [], isLoading, isError, refetch, isFetching } = useAdminCoupons();
  const createMutation = useCreateCoupon();
  const disableMutation = useDisableCoupon();
  const assignMutation = useAssignCoupon();

  const handleCreate = async (payload: CreateCouponPayload) => {
    await createMutation.mutateAsync(payload);
    setCreateOpen(false);
  };

  const handleDisable = async (coupon: Coupon) => {
    setDisablingId(coupon._id);
    try {
      await disableMutation.mutateAsync(coupon._id);
    } finally {
      setDisablingId(null);
    }
  };

  const handleAssign = async (couponId: string, userId: string) => {
    await assignMutation.mutateAsync({ couponId, userId });
    setAssignTarget(null);
  };

  const activeCoupons = coupons.filter(
    (c) => c.isActive && new Date(c.expiresAt) > new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
            <Tag size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Coupon Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create, disable, and assign discount coupons to users.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">Total: {coupons.length}</Badge>
        <Badge variant="success">Active: {activeCoupons}</Badge>
        <Badge variant="default">
          Expired / Disabled: {coupons.length - activeCoupons}
        </Badge>
        {isFetching && !isLoading && <Badge variant="warning">Refreshing…</Badge>}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isError ? (
          <div className="p-8">
            <EmptyState
              icon={<Tag size={28} />}
              title="Unable to load coupons"
              description="Check the coupon-service connection and try again."
              action={
                <Button onClick={() => refetch()}>
                  <RefreshCw size={14} /> Retry
                </Button>
              }
            />
          </div>
        ) : !isLoading && coupons.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Tag size={28} />}
              title="No coupons yet"
              description="Create your first coupon to get started."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus size={14} /> Create Coupon
                </Button>
              }
            />
          </div>
        ) : (
          <CouponTable
            coupons={coupons}
            isLoading={isLoading}
            disablingId={disablingId}
            onDisable={handleDisable}
            onAssign={setAssignTarget}
          />
        )}
      </div>

      <CreateCouponModal
        isOpen={createOpen}
        isLoading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <AssignCouponModal
        coupon={assignTarget}
        isOpen={!!assignTarget}
        isLoading={assignMutation.isPending}
        onClose={() => setAssignTarget(null)}
        onSubmit={handleAssign}
      />
    </div>
  );
}
