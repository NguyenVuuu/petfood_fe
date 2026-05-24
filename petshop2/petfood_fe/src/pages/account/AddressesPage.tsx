import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Address } from "@/types";
import { useAddresses } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const schema = z.object({
  fullName: z.string().min(2, "Please enter full name"),
  phone: z.string().regex(/^[0-9+\-()\s]{8,20}$/, "Invalid phone"),
  province: z.string().min(1, "Required"),
  district: z.string().min(1, "Required"),
  ward: z.string().min(1, "Required"),
  detailAddress: z.string().min(2, "Required"),
  label: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

const emptyDefaults: FormValues = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  detailAddress: "",
  label: "Home",
};

function AddressForm({
  initialValue,
  submitting,
  onSubmit,
}: {
  initialValue?: Address | null;
  submitting: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValue
      ? {
          fullName: initialValue.fullName,
          phone: initialValue.phone,
          province: initialValue.province,
          district: initialValue.district,
          ward: initialValue.ward,
          detailAddress: initialValue.detailAddress,
          label: initialValue.label,
        }
      : emptyDefaults,
  });

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Full name" {...register("fullName")} error={errors.fullName?.message} />
      <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Province" {...register("province")} error={errors.province?.message} />
        <Input label="District" {...register("district")} error={errors.district?.message} />
      </div>
      <Input label="Ward" {...register("ward")} error={errors.ward?.message} />
      <Input
        label="Detail address"
        {...register("detailAddress")}
        error={errors.detailAddress?.message}
      />
      <Input label="Label" {...register("label")} error={errors.label?.message} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={submitting}>
          Save address
        </Button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const { data, isLoading, createAddress, updateAddress, setDefaultAddress, deleteAddress, isMutating } =
    useAddresses();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const addresses = data ?? [];
  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault), [addresses]);

  const openCreate = () => {
    setEditing(null);
    setIsDialogOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setIsDialogOpen(true);
  };

  const submit = async (values: FormValues) => {
    if (editing) {
      await updateAddress({ id: editing.id, payload: values });
    } else {
      await createAddress(values);
    }
    setIsDialogOpen(false);
  };

  const onDelete = async (id: string) => {
    await deleteAddress(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Addresses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {defaultAddress && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <Star size={14} /> Default address for checkout
          </div>
          {defaultAddress.fullName} - {defaultAddress.phone} - {defaultAddress.detailAddress}, {defaultAddress.ward},{" "}
          {defaultAddress.district}, {defaultAddress.province}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && addresses.length === 0 && (
        <EmptyState
          icon={<Home size={28} />}
          title="No address yet"
          description="Add your first address to enable one-click checkout"
          action={<Button onClick={openCreate}>Add Address</Button>}
        />
      )}

      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{address.fullName}</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{address.phone}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin size={13} />
                  {address.detailAddress}, {address.ward}, {address.district}, {address.province}
                </p>
              </div>

              <div className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => openEdit(address)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  disabled={isMutating}
                  onClick={() => onDelete(address.id)}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editing ? "Edit Address" : "Add New Address"}
        size="lg"
      >
        <AddressForm initialValue={editing} submitting={isMutating} onSubmit={submit} />
      </Modal>
    </div>
  );
}
