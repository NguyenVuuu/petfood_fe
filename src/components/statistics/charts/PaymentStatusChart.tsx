import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#6b7280"];

export function PaymentStatusChart({ data }: { data: Array<{ status: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" outerRadius={110} label>
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
