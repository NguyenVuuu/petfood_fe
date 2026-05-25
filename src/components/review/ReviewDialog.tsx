import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateReview, useUpdateReview } from "@/hooks/useReviews";
import { Review } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { StarRating } from "./StarRating";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  orderId: string;
  productName: string;
  imageUrl?: string;
  initialReview?: Review | null;
}

export function ReviewDialog({
  isOpen,
  onClose,
  productId,
  orderId,
  productName,
  imageUrl,
  initialReview = null,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const isSubmitting = createReview.isPending || updateReview.isPending;

  useEffect(() => {
    if (isOpen) {
      setRating(initialReview?.rating ?? 0);
      setComment(initialReview?.comment ?? "");
      setError(null);
    }
  }, [initialReview, isOpen]);

  const handleSubmit = () => {
    const cleanComment = comment.trim();

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!cleanComment) {
      setError("Please write a short comment about this product.");
      return;
    }

    if (cleanComment.length > 1000) {
      setError("Comment must be 1000 characters or fewer.");
      return;
    }

    setError(null);

    if (initialReview) {
      updateReview.mutate(
        { reviewId: initialReview._id, payload: { productId, orderId, rating, comment: cleanComment } },
        { onSuccess: onClose },
      );
      return;
    }

    createReview.mutate(
      { productId, orderId, rating, comment: cleanComment },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialReview ? "Edit Review" : "Write Review"} size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/20">
          <img
            src={getImageUrl(imageUrl || "")}
            alt={productName}
            className="h-16 w-16 rounded-2xl object-cover bg-white"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Verified purchase review</p>
            <h3 className="truncate font-bold text-gray-900 dark:text-white">{productName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Only completed and paid orders can be reviewed.</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your rating</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
          <textarea
            rows={6}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did your pet like about this product? Share details that help other customers."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/30"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span className="inline-flex items-center gap-1"><MessageSquareText size={13} /> Images can be added later.</span>
            <span>{comment.length}/1000</span>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/20">{error}</p>}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" loading={isSubmitting} onClick={handleSubmit}>
            {initialReview ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
