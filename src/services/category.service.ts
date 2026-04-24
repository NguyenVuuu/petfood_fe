import apiClient from "@/lib/axios";
import {
  Category,
  CategoryNode,
  CategoryListResponse,
  CategoryFormPayload,
} from "@/types";

// ─── List (flat, paginated) ───────────────────────────────────────────────────
export interface CategoryListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  parentId?: string | null;
  isActive?: boolean;
}

export const categoryService = {
  /** GET /categories — flat list with pagination */
  async listCategories(params: CategoryListParams = {}): Promise<CategoryListResponse> {
    const { data } = await apiClient.get<CategoryListResponse>("/categories", { params });
    return data;
  },

  /** GET /categories/menu — nested tree with menuGroups (cached on server) */
  async getMenu(): Promise<CategoryNode[]> {
    const { data } = await apiClient.get<{ items: CategoryNode[] }>("/categories/menu");
    return data.items ?? [];
  },

  /** GET /categories/tree — plain nested tree (no menuGroups) */
  async getTree(): Promise<CategoryNode[]> {
    const { data } = await apiClient.get<{ items: CategoryNode[] }>("/categories/tree");
    return data.items ?? [];
  },

  /** GET /categories/:id */
  async getById(id: string): Promise<Category> {
    const { data } = await apiClient.get<{ category: Category }>(`/categories/${id}`);
    return data.category;
  },

  /** GET /categories/slug/:slug */
  async getBySlug(slug: string): Promise<Category> {
    const { data } = await apiClient.get<{ category: Category }>(`/categories/slug/${slug}`);
    return data.category;
  },

  /** POST /categories */
  async createCategory(payload: CategoryFormPayload): Promise<Category> {
    const { data } = await apiClient.post<{ category: Category }>("/categories", payload);
    return data.category;
  },

  /** PATCH /categories/:id */
  async updateCategory(id: string, payload: Partial<CategoryFormPayload>): Promise<Category> {
    const { data } = await apiClient.patch<{ category: Category }>(`/categories/${id}`, payload);
    return data.category;
  },

  /** DELETE /categories/:id (soft delete — sets isActive: false) */
  async deleteCategory(id: string): Promise<Category> {
    const { data } = await apiClient.delete<{ category: Category }>(`/categories/${id}`);
    return data.category;
  },
};

// ─── Helper: flatten CategoryNode tree → flat list with depth ────────────────
export function flattenTree(
  nodes: CategoryNode[],
  depth = 0
): (Category & { depth: number })[] {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenTree(node.children ?? [], depth + 1),
  ]);
}
