import { useState } from "react";
import { Plus, Search, RefreshCw, FolderTree } from "lucide-react";
import { motion } from "framer-motion";
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { CategoryTreeNode } from "@/components/CategoryTree/CategoryTreeNode";
import { CategoryForm } from "@/components/CategoryForm/CategoryForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CategoryNode, Category, CategoryFormPayload } from "@/types";
import { flattenTree } from "@/services/category.service";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TreeSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          style={{ width: `${100 - i * 5}%` }}
        />
      ))}
    </div>
  );
}

export default function AdminCategoryPage() {
  const { data: tree = [], isLoading, refetch } = useCategoryTree();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);

  // Filter tree by search
  const filterTree = (nodes: CategoryNode[], q: string): CategoryNode[] => {
    if (!q) return nodes;
    return nodes.reduce<CategoryNode[]>((acc, node) => {
      const children = filterTree(node.children ?? [], q);
      if (node.name.toLowerCase().includes(q.toLowerCase()) || children.length > 0) {
        acc.push({ ...node, children });
      }
      return acc;
    }, []);
  };

  const displayTree = filterTree(tree, search);
  const flatList = flattenTree(tree);

  const openCreate = (parentId?: string) => {
    setEditTarget(null);
    setDefaultParentId(parentId ?? null);
    setFormOpen(true);
  };

  const openEdit = (node: CategoryNode) => {
    setEditTarget(node as Category);
    setDefaultParentId(null);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: CategoryFormPayload) => {
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {flatList.length} total categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button onClick={() => openCreate()}>
            <Plus size={16} /> Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search size={14} />}
        className="max-w-sm"
      />

      {/* Tree */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Column headers */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
          <FolderTree size={15} className="text-amber-500" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Name / Slug
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:block">
            Level
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:block">
            Group
          </span>
          <span className="w-24 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Actions
          </span>
        </div>

        {isLoading ? (
          <TreeSkeleton />
        ) : displayTree.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl">🗂️</p>
            <p className="mt-3 font-medium text-gray-500 dark:text-gray-400">
              {search ? "No categories match your search" : "No categories yet"}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => openCreate()}>
                <Plus size={15} /> Create first category
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="divide-y divide-gray-50 py-2 dark:divide-gray-800/50"
          >
            {displayTree.map((node) => (
              <CategoryTreeNode
                key={node._id}
                node={node}
                depth={0}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onAddChild={(parentId) => openCreate(parentId)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        title={editTarget ? `Edit: ${editTarget.name}` : "New Category"}
        size="md"
      >
        <CategoryForm
          initial={editTarget}
          defaultParentId={defaultParentId}
          tree={tree}
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditTarget(null); }}
          isLoading={isMutating}
        />
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Delete{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {deleteTarget?.name}
            </span>
            ?{" "}
            {(deleteTarget?.children?.length ?? 0) > 0 && (
              <span className="text-amber-600">
                This category has {deleteTarget?.children?.length} child(ren).
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              className="flex-1"
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
