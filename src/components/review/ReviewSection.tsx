import { Link } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useProductReviews } from "@/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { StarRating } from "./StarRating";

interface ReviewSectionProps {
  productId: string;
}

const breakdownRows = [5, 4, 3, 2, 1] as const;

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, error, refetch } = useProductReviews(productId);
  const reviews = data?.reviews ?? [];
  const summary = data?.summary;
  const totalReviews = summary?.totalReviews ?? 0;

  return (
    <section className="mt-12 space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Reviews are written by customers with completed and paid orders.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
            You can write reviews from completed orders in My Orders.
          </div>
        ) : (
          <Link to="/login" className="inline-flex">
            <Button type="button" variant="outline">Login to review purchased orders</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px,1fr]">
        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/50">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average rating</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {(summary?.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-gray-400">/ 5</span>
          </div>
          <StarRating
            value={summary?.averageRating ?? 0}
            readonly
            reviewCount={totalReviews}
            className="mt-3"
          />

          <div className="mt-5 space-y-2">
            {breakdownRows.map((star) => {
              const count = summary?.ratingBreakdown?.[star] ?? 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-8">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {error ? (
            <EmptyState
              icon={<MessageCircleMore size={28} />}
              title="Could not load reviews"
              description="Please try again in a moment."
              action={<Button type="button" variant="outline" onClick={() => refetch()}>Retry</Button>}
            />
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
            </div>
          ) : (
            <EmptyState
              icon={<MessageCircleMore size={28} />}
              title="No reviews yet"
              description="Once customers complete paid orders, their reviews will appear here."
            />
          )}
        </div>
      </div>
    </section>
  );
}
