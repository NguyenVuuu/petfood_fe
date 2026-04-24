import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import { toggleWishlist } from "@/store/wishlistSlice";
import { Product } from "@/types";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.wishlist.items);

  const toggle = (product: Product) => {
    const isWishlisted = items.some((i) => i.productId === product._id);
    dispatch(
      toggleWishlist({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      })
    );
    if (isWishlisted) {
      toast.info(`${product.name} removed from wishlist`);
    } else {
      toast.success(`${product.name} added to wishlist! ❤️`);
    }
  };

  const isWishlisted = (productId: string) =>
    items.some((i) => i.productId === productId);

  return { items, toggle, isWishlisted };
}
