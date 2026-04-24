import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/50",
        className
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
