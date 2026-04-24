import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartService, getGuestToken, clearGuestToken } from "@/services/cart.service";
import { Product } from "@/types";
import { useAuth } from "./useAuth";

export const CART_KEY = "cart";

export function useCartApi() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: cart, isLoading } = useQuery({
    queryKey: [CART_KEY],
    queryFn: () => cartService.getCart(),
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [CART_KEY] });

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.addItem(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData([CART_KEY], updatedCart);
    },
    onError: () => toast.error("Failed to add item to cart"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.updateItem(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData([CART_KEY], updatedCart);
    },
    onError: () => toast.error("Failed to update quantity"),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.removeItem(productId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData([CART_KEY], updatedCart);
      toast.info("Item removed from cart");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const clearMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData([CART_KEY], updatedCart);
    },
    onError: () => toast.error("Failed to clear cart"),
  });

  const mergeMutation = useMutation({
    mutationFn: (guestToken: string) => cartService.mergeCart(guestToken),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData([CART_KEY], updatedCart);
      clearGuestToken();
    },
  });

  const addItem = (product: Product, quantity = 1) => {
    addMutation.mutate(
      { productId: product._id, quantity },
      { onSuccess: () => toast.success(`${product.name} added to cart! 🛒`) }
    );
  };

  const remove = (productId: string) => removeMutation.mutate(productId);

  const updateQty = (productId: string, quantity: number) => {
    if (quantity < 1) {
      remove(productId);
      return;
    }
    updateMutation.mutate({ productId, quantity });
  };

  const clear = () => clearMutation.mutate();

  /** Call after login to merge guest cart into user cart */
  const mergeGuestCart = () => {
    if (!isAuthenticated) return;
    const guestToken = localStorage.getItem("cartGuestToken");
    if (guestToken) {
      mergeMutation.mutate(guestToken, {
        onSuccess: () => invalidate(),
      });
    }
  };

  const items = cart?.items ?? [];
  const totals = cart?.totals ?? { subtotal: 0, totalItems: 0 };

  const isInCart = (productId: string) =>
    items.some((i) => i.productId.toString() === productId);

  const getItemQuantity = (productId: string) =>
    items.find((i) => i.productId.toString() === productId)?.quantity ?? 0;

  return {
    cart,
    items,
    totals,
    totalItems: totals.totalItems,
    totalAmount: totals.subtotal,
    isLoading,
    addItem,
    remove,
    updateQty,
    clear,
    mergeGuestCart,
    isInCart,
    getItemQuantity,
    isAdding: addMutation.isPending,
  };
}
