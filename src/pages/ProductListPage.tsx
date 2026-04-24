import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { useCategoryList } from "@/hooks/useCategories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

interface FilterState {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: searchParams.get("categoryId") ?? "",
    minPrice: "",
    maxPrice: "",
    sortBy: "",
  });

  const debouncedSearch = useDebounce(searchInput, 400);

  const { data: catData } = useCategoryList({ limit: 100, isActive: true });
  const categories = catData?.items ?? [];

  const [sortBy, sortOrder] = (filters.sortBy || "createdAt:desc").split(":") as [
    "createdAt" | "price" | "name",
    "asc" | "desc"
  ];

  const { data, isLoading } = useProducts({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    categoryId: filters.categoryId || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    sortBy,
    sortOrder,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, filters.categoryId, setSearchParams]);

  const products = data?.items ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {t("pawmart.products.title")}
          </h1>
          {!isLoading && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {total} {t("pawmart.products.found")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-64">
            <Input
              placeholder={t("pawmart.products.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search size={14} />}
              rightIcon={
                searchInput ? (
                  <button onClick={() => setSearchInput("")}>
                    <X size={14} />
                  </button>
                ) : undefined
              }
            />
          </div>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            {t("pawmart.products.filters")}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
          />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-6 shadow-xl dark:bg-gray-950">
              <FilterSidebar
                filters={filters}
                onFilterChange={(f) => { setFilters(f); setSidebarOpen(false); }}
                categories={categories}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 space-y-6">
          <ProductGrid products={products} isLoading={isLoading} skeletonCount={12} />
          {!isLoading && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
