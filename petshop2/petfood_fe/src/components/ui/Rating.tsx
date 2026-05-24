import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingProps) {
  const starSize = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = value >= i + 1;
        const half = !filled && value >= i + 0.5;
        return (
          <span key={i} className="relative inline-block">
            <Star
              size={starSize}
              className="text-gray-200 dark:text-gray-700"
              fill="currentColor"
            />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star
                  size={starSize}
                  className="text-amber-400"
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {value.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-400">({reviewCount})</span>
      )}
    </div>
  );
}
