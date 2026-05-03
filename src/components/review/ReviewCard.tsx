import { Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Review } from "@/types";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: Review;
  isOwner?: boolean;
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function ReviewCard({
  review,
  isOwner = false,
  isDeleting = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt={review.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              review.fullName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">{review.fullName}</h4>
              {review.verifiedPurchase && (
                <Badge variant="success">
                  <ShieldCheck size={12} />
                  Verified purchase
                </Badge>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <StarRating value={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
              <Pencil size={14} />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              loading={isDeleting}
              onClick={onDelete}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        )}
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600 dark:text-gray-300">
        {review.comment || "No written comment provided."}
      </p>
    </article>
  );
}