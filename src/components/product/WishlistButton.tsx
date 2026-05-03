import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToggleWishlist } from "@/hooks/useWishlistApi";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: number;
}

export function WishlistButton({ productId, productName, className, size = 15 }: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toggle, isWishlisted, isPending } = useToggleWishlist();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggle(productId, productName);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-60 dark:bg-gray-800/90",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={wishlisted ? "filled" : "empty"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            size={size}
            className={wishlisted ? "text-red-500" : "text-gray-400"}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
