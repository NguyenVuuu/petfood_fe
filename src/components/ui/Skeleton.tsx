import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="mt-3 space-y-2 p-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
