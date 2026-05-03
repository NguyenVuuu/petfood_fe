import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wishlistService, WishlistApiResponse } from "@/services/wishlist.service";
import { useAuth } from "./useAuth";

export const WISHLIST_KEY = ["wishlist"];

/** Full wishlist with hydrated product data */
export function useWishlistQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => wishlistService.getMyWishlist(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

/** Toggle add/remove with optimistic update */
export function useToggleWishlist() {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();

  const addMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: WISHLIST_KEY });
      const prev = qc.getQueryData<WishlistApiResponse>(WISHLIST_KEY);
      // Optimistically add productId
      if (prev) {
        qc.setQueryData<WishlistApiResponse>(WISHLIST_KEY, {
          ...prev,
          productIds: [...prev.productIds, productId],
          total: prev.total + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _productId, ctx) => {
      if (ctx?.prev) qc.setQueryData(WISHLIST_KEY, ctx.prev);
      toast.error("Failed to add to wishlist");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: WISHLIST_KEY });
      const prev = qc.getQueryData<WishlistApiResponse>(WISHLIST_KEY);
      if (prev) {
        qc.setQueryData<WishlistApiResponse>(WISHLIST_KEY, {
          ...prev,
          productIds: prev.productIds.filter((id) => id !== productId),
          items: prev.items.filter((i) => i.productId !== productId),
          total: Math.max(0, prev.total - 1),
        });
      }
      return { prev };
    },
    onError: (_err, _productId, ctx) => {
      if (ctx?.prev) qc.setQueryData(WISHLIST_KEY, ctx.prev);
      toast.error("Failed to remove from wishlist");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });

  const toggle = (productId: string, productName?: string) => {
    if (!isAuthenticated) return false; // caller should redirect to login

    const current = qc.getQueryData<WishlistApiResponse>(WISHLIST_KEY);
    const isWishlisted = current?.productIds.includes(productId) ?? false;

    if (isWishlisted) {
      removeMutation.mutate(productId, {
        onSuccess: () => toast.info(`${productName ?? "Product"} removed from wishlist`),
      });
    } else {
      addMutation.mutate(productId, {
        onSuccess: () => toast.success(`${productName ?? "Product"} added to wishlist! ❤️`),
      });
    }
    return true;
  };

  const isWishlisted = (productId: string) => {
    const current = qc.getQueryData<WishlistApiResponse>(WISHLIST_KEY);
    return current?.productIds.includes(productId) ?? false;
  };

  const isPending = addMutation.isPending || removeMutation.isPending;

  return { toggle, isWishlisted, isPending };
}

/** Convenience: clear wishlist cache on logout */
export function clearWishlistCache(qc: ReturnType<typeof useQueryClient>) {
  qc.removeQueries({ queryKey: WISHLIST_KEY });
}
