import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSaveReview } from "@/hooks/useReviews";
import { Review } from "@/types";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  productId: string;
  initialReview?: Review | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  initialReview = null,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const saveReviewMutation = useSaveReview(productId);

  useEffect(() => {
    setRating(initialReview?.rating ?? 0);
    setComment(initialReview?.comment ?? "");
    setError(null);
  }, [initialReview]);

  const handleSubmit = () => {
    if (rating < 1) {
      setError("Please select a star rating before submitting.");
      return;
    }

    setError(null);
    saveReviewMutation.mutate(
      {
        rating,
        comment: comment.trim(),
      },
      {
        onSuccess: (review) => {
          setRating(review.rating);
          setComment(review.comment);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-xl bg-white p-2 text-amber-500 shadow-sm dark:bg-gray-900">
          <MessageSquareText size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initialReview ? "Edit your review" : "Write a review"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Share your honest experience so other pet parents can decide faster.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your rating</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Comment
          </label>
          <textarea
            rows={5}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did your pet like or dislike about this product?"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/30"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>You can update your review later.</span>
            <span>{comment.length}/1000</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" loading={saveReviewMutation.isPending} onClick={handleSubmit}>
            {initialReview ? "Update review" : "Submit review"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}