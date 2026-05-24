import { ReactNode } from "react";

export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-bold text-gray-950 dark:text-white">{title}</h2>
      <div className="h-80">{children}</div>
    </section>
  );
}
