import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressService } from "@/services/address.service";
import { AddressPayload } from "@/types";

export const ADDRESS_QUERY_KEY = ["user-addresses"];

export function useAddresses() {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ADDRESS_QUERY_KEY,
    queryFn: addressService.getMyAddresses,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: AddressPayload) => addressService.createAddress(payload),
    onSuccess: () => {
      toast.success("Address added successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to add address"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) =>
      addressService.updateAddress(id, payload),
    onSuccess: () => {
      toast.success("Address updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update address"),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => {
      toast.success("Default address updated");
      invalidate();
    },
    onError: () => toast.error("Failed to set default address"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      toast.success("Address deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete address"),
  });

  return {
    ...addressesQuery,
    createAddress: createMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      setDefaultMutation.isPending ||
      deleteMutation.isPending,
  };
}
