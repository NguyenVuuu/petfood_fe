import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { removeFromWishlist } from "@/store/wishlistSlice";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WishlistPage() {
  const { items } = useWishlist();
  const dispatch = useAppDispatch();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <EmptyState
          icon={<Heart size={32} />}
          title="Your wishlist is empty"
          description="Save products you love by clicking the heart icon!"
          action={
            <Link to="/products">
              <Button>
                Discover Products <ArrowRight size={16} />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          ❤️ Wishlist
          <span className="ml-2 text-lg font-normal text-gray-400">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <button
                onClick={() => dispatch(removeFromWishlist(item.productId))}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-gray-800/90"
              >
                <Trash2 size={12} />
              </button>
              <Link to={`/products/${item.productId}`} className="overflow-hidden rounded-t-2xl">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x400/fef3c7/92400e?text=🐾";
                  }}
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link to={`/products/${item.productId}`}>
                  <h3 className="line-clamp-2 text-xs font-semibold text-gray-900 hover:text-amber-500 dark:text-gray-100 dark:hover:text-amber-400">
                    {item.name}
                  </h3>
                </Link>
                <p className="font-bold text-amber-500">{formatPrice(item.price)}</p>
                <Link to={`/products/${item.productId}`}>
                  <Button size="sm" className="w-full">
                    <ShoppingCart size={12} />
                    View Product
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
