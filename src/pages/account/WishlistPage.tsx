import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWishlist } from "@/hooks/useWishlist";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { removeFromWishlist } from "@/store/wishlistSlice";
import { useProducts } from "@/hooks/useProducts";
import { useCartApi } from "@/hooks/useCartApi";
import { Product } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";

export default function AccountWishlistPage() {
  const { items } = useWishlist();
  const dispatch = useAppDispatch();
  const { addItem } = useCartApi();
  const { data: productData } = useProducts({ page: 1, limit: 200 });

  const productById = new Map((productData?.items ?? []).map((p) => [p._id, p]));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={32} className="text-red-400" />}
        title="Your wishlist is empty"
        description="Explore products and tap the heart icon to save your favorites."
        action={<Link to="/products"><Button>Browse Products <ArrowRight size={14} /></Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Wishlist <span className="ml-1 text-sm font-normal text-gray-400">({items.length})</span>
        </h2>
        <Link to="/products" className="text-sm font-medium text-amber-500 hover:underline">
          Continue shopping →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const product = productById.get(item.productId) as Product | undefined;
          const inStock = (product?.stock ?? 0) > 0;

          return (
            <div
              key={item.productId}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300/fef3c7/92400e?text=🐾"; }}
                  />
                </Link>
                {/* Remove button */}
                <button
                  onClick={() => dispatch(removeFromWishlist(item.productId))}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-gray-900/90"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>
                {/* Stock badge */}
                {!inStock && (
                  <div className="absolute bottom-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    Out of stock
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <Link
                  to={`/products/${item.productId}`}
                  className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-amber-600 dark:text-white"
                >
                  {item.name}
                </Link>
                <p className="mt-2 text-lg font-bold text-amber-500">{formatPrice(item.price)}</p>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  disabled={!inStock}
                  onClick={() => { if (product) addItem(product, 1); }}
                >
                  <ShoppingCart size={14} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
