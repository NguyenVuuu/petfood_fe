import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService, CategoryListParams } from "@/services/category.service";
import { CategoryFormPayload } from "@/types";

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
  menu: () => [...CATEGORY_KEYS.all, "menu"] as const,
  tree: () => [...CATEGORY_KEYS.all, "tree"] as const,
  list: (params?: CategoryListParams) => [...CATEGORY_KEYS.all, "list", params] as const,
};

/** Mega menu — cached 5 min (server also caches) */
export function useCategoryMenu() {
  return useQuery({
    queryKey: CATEGORY_KEYS.menu(),
    queryFn: () => categoryService.getMenu(),
    staleTime: 5 * 60_000,
  });
}

/** Full tree for admin tree view */
export function useCategoryTree() {
  return useQuery({
    queryKey: CATEGORY_KEYS.tree(),
    queryFn: () => categoryService.getTree(),
    staleTime: 2 * 60_000,
  });
}

/** Flat paginated list — for admin table / dropdowns */
export function useCategoryList(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () => categoryService.listCategories(params),
    staleTime: 2 * 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryFormPayload) => categoryService.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success("Category created!");
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryFormPayload> }) =>
      categoryService.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success("Category updated!");
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success("Category deleted.");
    },
    onError: () => toast.error("Failed to delete category"),
  });
}
