import { ReactNode } from "react";

export function StatisticsCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <div className="mt-2 text-2xl font-black text-gray-950 dark:text-white">{value}</div>
          {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
        {icon && (
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
