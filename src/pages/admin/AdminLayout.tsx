import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  LogOut,
  ChevronRight,
  Menu,
  Banknote,
  Clock3,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/admin", end: true, icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/admin/categories", end: false, icon: <FolderTree size={18} />, label: "Categories" },
  { to: "/admin/orders", end: false, icon: <ShoppingCart size={18} />, label: "Orders" },
  { to: "/admin/orders/pending", end: false, icon: <Clock3 size={18} />, label: "Pending Orders" },
  { to: "/admin/payments/banking", end: false, icon: <Banknote size={18} />, label: "Banking Payments" },
  { to: "/admin/users", end: false, icon: <Users size={18} />, label: "Users" },
  { to: "/admin/coupons", end: false, icon: <Tag size={18} />, label: "Coupons" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div className="flex items-center gap-3 border-b border-gray-800 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-lg">P</div>
        <div>
          <div className="font-bold text-white">PawMart</div>
          <div className="text-xs text-gray-400">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )
            }
          >
            {item.icon}
            {item.label}
            {<ChevronRight size={14} className="ml-auto opacity-50" />}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-amber-500/20 ring-1 ring-amber-500/30">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-amber-400">
                {user?.fullName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{user?.fullName}</div>
            <div className="truncate text-xs text-gray-400">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex min-h-12 w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      <aside className="hidden w-64 shrink-0 shadow-xl lg:flex lg:flex-col">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
          <div className="font-semibold text-gray-900 dark:text-white">Admin Panel</div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
