export function StatisticsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
        Admin Analytics
      </p>
      <h1 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
