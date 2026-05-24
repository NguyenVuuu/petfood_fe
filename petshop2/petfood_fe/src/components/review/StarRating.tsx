import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const activeValue = hoverValue ?? value;
  const stars = useMemo(() => Array.from({ length: 5 }, (_, index) => index + 1), []);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const fillPercent = readonly
            ? Math.max(0, Math.min(1, activeValue - (star - 1))) * 100
            : activeValue >= star
              ? 100
              : 0;

          const icon = (
            <span className="relative inline-flex">
              <Star className={cn(sizeMap[size], "text-gray-200 dark:text-gray-700")} fill="currentColor" />
              {fillPercent > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                  <Star className={cn(sizeMap[size], "text-amber-400")} fill="currentColor" />
                </span>
              )}
            </span>
          );

          if (readonly) {
            return <span key={star}>{icon}</span>;
          }

          return (
            <button
              key={star}
              type="button"
              className="cursor-pointer transition-transform hover:scale-110"
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={() => onChange?.(star)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              {icon}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {value.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && <span className="text-sm text-gray-400">({reviewCount})</span>}
    </div>
  );
}