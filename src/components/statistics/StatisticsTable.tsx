import { ReactNode } from "react";

export function StatisticsTable({
  columns,
  rows,
  renderRow,
}: {
  columns: string[];
  rows: any[];
  renderRow: (row: any, index: number) => ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-950/50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left font-semibold text-gray-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
