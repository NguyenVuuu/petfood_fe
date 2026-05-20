export function StatisticsEmptyState({
  title = "No statistics data for this time range",
}: {
  title?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
      {title}
    </div>
  );
}
