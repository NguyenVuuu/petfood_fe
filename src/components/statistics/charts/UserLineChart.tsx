import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function UserLineChart({ data }: { data: Array<{ label: string; newUsers: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="newUsers" stroke="#2563eb" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
