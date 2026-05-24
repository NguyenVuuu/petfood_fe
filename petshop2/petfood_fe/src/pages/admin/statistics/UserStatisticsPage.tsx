import { UserCheck, UserPlus, UserX, Users } from "lucide-react";
import { useUserStatistics } from "@/hooks/useStatistics";
import { StatisticsCard } from "@/components/statistics/StatisticsCard";
import { ChartCard } from "@/components/statistics/ChartCard";
import { StatisticsTable } from "@/components/statistics/StatisticsTable";
import { StatisticsError, StatisticsLoading } from "@/components/statistics/StatisticsState";
import { UserLineChart } from "@/components/statistics/charts/UserLineChart";
import { StatisticsPageShell, formatDate, useStatisticsFilter } from "./helpers";

export default function UserStatisticsPage() {
  const [filter, setFilter] = useStatisticsFilter();
  const query = useUserStatistics(filter);
  const data = query.data;

  return (
    <StatisticsPageShell title="Thống kê user" description="Theo dõi user mới, user active theo last login và trạng thái tài khoản." filter={filter} setFilter={setFilter}>
      {query.isLoading && <StatisticsLoading />}
      {query.isError && <StatisticsError onRetry={() => query.refetch()} />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatisticsCard label="New Users" value={data.summary.newUsers} icon={<UserPlus />} />
            <StatisticsCard label="Active Users" value={data.summary.activeUsers} icon={<UserCheck />} />
            <StatisticsCard label="Inactive Users" value={data.summary.inactiveUsers} icon={<UserX />} />
            <StatisticsCard label="Total Users" value={data.summary.totalUsers} icon={<Users />} />
          </div>
          <ChartCard title="New Users Over Time">
            <UserLineChart data={data.chart} />
          </ChartCard>
          <StatisticsTable
            columns={["User", "Email", "Role", "Joined At", "Last Login", "Status"]}
            rows={data.recentUsers}
            renderRow={(row) => (
              <tr key={row.userId}>
                <td className="px-4 py-3 font-semibold">{row.fullName}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.role}</td>
                <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">{formatDate(row.lastLoginAt)}</td>
                <td className="px-4 py-3">{row.isActive ? "Active" : "Inactive"}</td>
              </tr>
            )}
          />
        </div>
      )}
    </StatisticsPageShell>
  );
}
