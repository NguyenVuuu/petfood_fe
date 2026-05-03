import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useDeleteReview, useProductReviews } from "@/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "./StarRating";

interface ReviewSectionProps {
  productId: string;
  canReview?: boolean;
}

export function ReviewSection({ productId, canReview = true }: ReviewSectionProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const currentUserId = user?.id ?? user?._id ?? "";
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, isLoading, error, refetch } = useProductReviews(productId);
  const deleteReviewMutation = useDeleteReview(productId);
  const myReview = data?.myReview ?? null;

  const visibleReviews = useMemo(
    () => (data?.reviews ?? []).filter((review) => review.status === "visible"),
    [data?.reviews],
  );

  const handleDeleteReview = (reviewId: string) => {
    if (!window.confirm("Delete your review? This action cannot be undone.")) {
      return;
    }

    deleteReviewMutation.mutate(reviewId, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  return (
    <section className="mt-12 space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer reviews</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real feedback from shoppers who have tried this product.
          </p>
        </div>

        {isAuthenticated && canReview ? (
          <Button
            type="button"
            variant={isFormOpen ? "outline" : "primary"}
            onClick={() => setIsFormOpen((prev) => !prev)}
          >
            {myReview
              ? isFormOpen
                ? "Close editor"
                : "Edit your review"
              : isFormOpen
                ? "Close form"
                : "Write a review"}
          </Button>
        ) : canReview ? (
          <Link to="/login" className="inline-flex">
            <Button type="button" variant="outline">Sign in to review</Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/50">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average rating</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {(data?.summary.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-gray-400">/ 5</span>
          </div>
          <StarRating
            value={data?.summary.averageRating ?? 0}
            readonly
            reviewCount={data?.summary.totalReviews ?? 0}
            className="mt-3"
          />
        </div>

        <div className="space-y-4">
          {myReview?.status === "hidden" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">Hidden review</Badge>
                <span>Your latest review is currently hidden by an admin.</span>
              </div>
            </div>
          )}

          {isFormOpen && isAuthenticated && canReview && (
            <ReviewForm
              productId={productId}
              initialReview={myReview}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          )}

          {error ? (
            <EmptyState
              icon={<MessageCircleMore size={28} />}
              title="Could not load reviews"
              description="Please try again in a moment."
              action={
                <Button type="button" variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : visibleReviews.length > 0 ? (
            <div className="space-y-4">
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  isOwner={!!currentUserId && review.userId === currentUserId}
                  isDeleting={deleteReviewMutation.isPending}
                  onEdit={() => setIsFormOpen(true)}
                  onDelete={() => handleDeleteReview(review._id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessageCircleMore size={28} />}
              title="No reviews yet"
              description="Be the first customer to share your experience with this product."
            />
          )}
        </div>
      </div>
    </section>
  );
}