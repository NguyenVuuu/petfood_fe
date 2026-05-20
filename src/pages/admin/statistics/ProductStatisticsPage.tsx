import { AlertTriangle, Boxes, TrendingUp } from "lucide-react";
import { useProductStatistics } from "@/hooks/useStatistics";
import { StatisticsCard } from "@/components/statistics/StatisticsCard";
import { StatisticsTable } from "@/components/statistics/StatisticsTable";
import { StatisticsEmptyState } from "@/components/statistics/EmptyState";
import { StatisticsError, StatisticsLoading } from "@/components/statistics/StatisticsState";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { StatisticsPageShell, useStatisticsFilter } from "./helpers";

export default function ProductStatisticsPage() {
  const [filter, setFilter] = useStatisticsFilter();
  const query = useProductStatistics(filter);
  const data = query.data;

  return (
    <StatisticsPageShell title="Thống kê product" description="Sản phẩm bán chạy từ order-service và tồn kho thấp từ product-service." filter={filter} setFilter={setFilter}>
      {query.isLoading && <StatisticsLoading />}
      {query.isError && <StatisticsError onRetry={() => query.refetch()} />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatisticsCard label="Total Products" value={data.summary.totalProducts} icon={<Boxes />} />
            <StatisticsCard label="Low Stock Products" value={data.summary.lowStockProducts} icon={<AlertTriangle />} />
            <StatisticsCard label="Top Selling Items" value={data.topSellingProducts.length} icon={<TrendingUp />} />
          </div>

          {data.topSellingProducts.length ? (
            <StatisticsTable
              columns={["Product", "Sold Quantity", "Revenue"]}
              rows={data.topSellingProducts}
              renderRow={(row) => (
                <tr key={row.productId}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(row.imageUrl)} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-semibold">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.soldQuantity}</td>
                  <td className="px-4 py-3">{formatPrice(row.revenue)}</td>
                </tr>
              )}
            />
          ) : (
            <StatisticsEmptyState title="No top-selling product data for this time range" />
          )}

          <StatisticsTable
            columns={["Low Stock Product", "Stock"]}
            rows={data.lowStockList}
            renderRow={(row) => (
              <tr key={row.productId}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(row.imageUrl)} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-semibold">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-red-600">{row.stock}</td>
              </tr>
            )}
          />
        </div>
      )}
    </StatisticsPageShell>
  );
}
