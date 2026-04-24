import { Package, ShoppingCart, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/utils";

const STAT_CARDS = [
  {
    title: "Total Products",
    icon: <Package size={22} />,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    key: "products",
  },
  {
    title: "Total Orders",
    icon: <ShoppingCart size={22} />,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
    key: "orders",
  },
  {
    title: "Total Users",
    icon: <Users size={22} />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    key: "users",
  },
  {
    title: "Revenue",
    icon: <TrendingUp size={22} />,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    key: "revenue",
  },
];

export default function AdminDashboard() {
  const { data } = useProducts({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const products = data?.products ?? [];
  const totalProducts = data?.total ?? 0;

  const stats = {
    products: totalProducts,
    orders: 128,       // mock
    users: 432,        // mock
    revenue: 45_800_000, // mock
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Welcome back to your admin panel 🐾</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {card.key === "revenue"
                  ? formatPrice(stats.revenue)
                  : stats[card.key as keyof typeof stats].toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent products */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Products</h2>
          <Link
            to="/admin/products"
            className="flex items-center gap-1 text-sm text-amber-500 hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No products yet</div>
          ) : (
            products.map((p) => (
              <div key={p._id} className="flex items-center gap-4 p-4">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-12 w-12 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/50x50/fef3c7/92400e?text=🐾";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                </div>
                <div className="text-sm font-bold text-amber-500">
                  {formatPrice(p.price)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
