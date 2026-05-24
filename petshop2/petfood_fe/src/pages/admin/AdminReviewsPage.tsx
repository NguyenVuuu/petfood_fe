import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, RefreshCw, Star, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { Review } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminReviewsResponse {
  reviews: Review[];
  total: number;
}

async function fetchAdminReviews(params: { page: number; keyword?: string }): Promise<AdminReviewsResponse> {
  const { data } = await apiClient.get("/reviews/admin", { params });
  return data;
}

async function updateReviewStatus(reviewId: string, status: "visible" | "hidden"): Promise<void> {
  await apiClient.patch(`/reviews/admin/${reviewId}/status`, { status });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-reviews", page, keyword],
    queryFn: () => fetchAdminReviews({ page, keyword: keyword || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "visible" | "hidden" }) =>
      updateReviewStatus(id, status),
    onSuccess: () => {
      toast.success("Review status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to update review"),
  });

  const reviews = data?.reviews ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reviews Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Moderate customer reviews — show or hide them from product pages.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-72">
            <Input
              placeholder="Search by product or user..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">Total: {data?.total ?? 0}</Badge>
        <Badge variant="success">
          Visible: {reviews.filter((r) => r.status === "visible").length}
        </Badge>
        <Badge variant="default">
          Hidden: {reviews.filter((r) => r.status === "hidden").length}
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isError ? (
          <div className="p-8">
            <EmptyState
              icon={<MessageSquare size={28} />}
              title="Unable to load reviews"
              description="Check the review-service connection and try again."
              action={
                <Button onClick={() => refetch()}>
                  <RefreshCw size={14} /> Retry
                </Button>
              }
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<MessageSquare size={28} />}
              title="No reviews found"
              description="No reviews match your current filter."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.map((review) => (
              <div key={review._id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {review.fullName}
                    </span>
                    <StarRating rating={review.rating} />
                    {review.verifiedPurchase && (
                      <Badge variant="success">Verified Purchase</Badge>
                    )}
                    <Badge variant={review.status === "visible" ? "info" : "default"}>
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={review.status === "visible" ? "outline" : "secondary"}
                  onClick={() =>
                    statusMutation.mutate({
                      id: review._id,
                      status: review.status === "visible" ? "hidden" : "visible",
                    })
                  }
                  loading={statusMutation.isPending}
                >
                  {review.status === "visible" ? (
                    <><EyeOff size={14} /> Hide</>
                  ) : (
                    <><Eye size={14} /> Show</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {(data?.total ?? 0) > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-500">Page {page}</span>
          <Button
            variant="outline"
            disabled={reviews.length < 20}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
