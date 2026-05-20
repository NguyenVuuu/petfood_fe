import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

export function RevenueLineChart({
  data,
}: {
  data: Array<{ label: string; revenue: number; orders: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
        <Tooltip formatter={(value) => formatPrice(Number(value))} />
        <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
