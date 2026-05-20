import { BadgePercent, Tag } from "lucide-react";
import { useCouponStatistics } from "@/hooks/useStatistics";
import { StatisticsCard } from "@/components/statistics/StatisticsCard";
import { ChartCard } from "@/components/statistics/ChartCard";
import { StatisticsTable } from "@/components/statistics/StatisticsTable";
import { StatisticsEmptyState } from "@/components/statistics/EmptyState";
import { StatisticsError, StatisticsLoading } from "@/components/statistics/StatisticsState";
import { CouponBarChart } from "@/components/statistics/charts/CouponBarChart";
import { formatPrice } from "@/lib/utils";
import { StatisticsPageShell, useStatisticsFilter } from "./helpers";

export default function CouponStatisticsPage() {
  const [filter, setFilter] = useStatisticsFilter();
  const query = useCouponStatistics(filter);
  const data = query.data;

  return (
    <StatisticsPageShell title="Thống kê coupon" description="Chỉ tính coupon đã được dùng thật sự, không tính coupon chỉ mới assign." filter={filter} setFilter={setFilter}>
      {query.isLoading && <StatisticsLoading />}
      {query.isError && <StatisticsError onRetry={() => query.refetch()} />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatisticsCard label="Coupons Used" value={data.summary.couponsUsed} icon={<Tag />} />
            <StatisticsCard label="Total Discount Amount" value={formatPrice(data.summary.totalDiscountAmount)} icon={<BadgePercent />} />
            <StatisticsCard label="Most Used Coupon" value={data.summary.mostUsedCoupon || "-"} />
          </div>
          {data.chart.length ? (
            <ChartCard title="Top Used Coupons">
              <CouponBarChart data={data.chart} />
            </ChartCard>
          ) : (
            <StatisticsEmptyState />
          )}
          <StatisticsTable
            columns={["Code", "Scope", "Used Count", "Discount Amount", "Expiration", "Status"]}
            rows={data.table}
            renderRow={(row) => (
              <tr key={row.couponId}>
                <td className="px-4 py-3 font-bold text-amber-600">{row.code}</td>
                <td className="px-4 py-3">{row.scope}</td>
                <td className="px-4 py-3">{row.usedCount}</td>
                <td className="px-4 py-3">{formatPrice(row.totalDiscountAmount)}</td>
                <td className="px-4 py-3">{new Date(row.expiresAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3">{row.isActive ? "Active" : "Disabled"}</td>
              </tr>
            )}
          />
        </div>
      )}
    </StatisticsPageShell>
  );
}
