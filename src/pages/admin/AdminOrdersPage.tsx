import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
        <div className="rounded-2xl bg-teal-100 p-3 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <ShoppingCart size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order management workspace is reserved here.
          </p>
        </div>
      </div>

      <Badge variant="outline">No order admin API wired to this screen yet</Badge>
    </div>
  );
}