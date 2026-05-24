import { Clock3, Package, PackageCheck, Truck, XCircle } from "lucide-react";
import { useOrderStatistics } from "@/hooks/useStatistics";
import { StatisticsCard } from "@/components/statistics/StatisticsCard";
import { ChartCard } from "@/components/statistics/ChartCard";
import { StatisticsTable } from "@/components/statistics/StatisticsTable";
import { StatisticsError, StatisticsLoading } from "@/components/statistics/StatisticsState";
import { OrderStatusChart } from "@/components/statistics/charts/OrderStatusChart";
import { formatPrice } from "@/lib/utils";
import { StatisticsPageShell, formatDate, useStatisticsFilter } from "./helpers";

export default function OrderStatisticsPage() {
  const [filter, setFilter] = useStatisticsFilter();
  const query = useOrderStatistics(filter);
  const data = query.data;

  return (
    <StatisticsPageShell title="Thống kê đơn hàng" description="Tổng quan trạng thái đơn hàng và các đơn mới nhất." filter={filter} setFilter={setFilter}>
      {query.isLoading && <StatisticsLoading />}
      {query.isError && <StatisticsError onRetry={() => query.refetch()} />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <StatisticsCard label="Total Orders" value={data.summary.totalOrders} icon={<Package />} />
            <StatisticsCard label="Pending" value={data.summary.pendingOrders} icon={<Clock3 />} />
            <StatisticsCard label="Shipping" value={data.summary.shippingOrders} icon={<Truck />} />
            <StatisticsCard label="Completed" value={data.summary.completedOrders} icon={<PackageCheck />} />
            <StatisticsCard label="Cancelled" value={data.summary.cancelledOrders} icon={<XCircle />} />
          </div>
          <ChartCard title="Orders by Status">
            <OrderStatusChart data={data.chart} />
          </ChartCard>
          <StatisticsTable
            columns={["Order ID", "User", "Total", "Payment", "Status", "Created At"]}
            rows={data.recentOrders}
            renderRow={(row) => (
              <tr key={row.orderId}>
                <td className="px-4 py-3 font-mono">#{String(row.orderId).slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3">{String(row.userId).slice(-8)}</td>
                <td className="px-4 py-3">{formatPrice(row.totalAmount)}</td>
                <td className="px-4 py-3">{row.paymentStatus}</td>
                <td className="px-4 py-3">{row.orderStatus}</td>
                <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
              </tr>
            )}
          />
        </div>
      )}
    </StatisticsPageShell>
  );
}
