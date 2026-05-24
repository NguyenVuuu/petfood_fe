import { useState } from "react";
import { ChevronRight, Pencil, Trash2, Plus, FolderOpen, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryNode } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  node: CategoryNode;
  depth?: number;
  onEdit: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
  onAddChild: (parentId: string) => void;
}

export function CategoryTreeNode({ node, depth = 0, onEdit, onDelete, onAddChild }: Props) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = (node.children?.length ?? 0) > 0;

  const sorted = [...(node.children ?? [])].sort(
    (a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0)
  );

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
          depth === 0 && "font-semibold"
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400 transition-colors",
            hasChildren ? "hover:text-gray-600 dark:hover:text-gray-200" : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight
            size={13}
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* Icon */}
        <span className="text-amber-500">
          {hasChildren && expanded ? <FolderOpen size={15} /> : <Folder size={15} />}
        </span>

        {/* Name */}
        <span className="flex-1 truncate text-sm text-gray-900 dark:text-gray-100">
          {node.name}
        </span>

        {/* Meta */}
        <span className="hidden text-xs text-gray-400 sm:inline">
          /{node.slug}
        </span>
        {node.level !== undefined && (
          <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400 sm:inline">
            L{node.level}
          </span>
        )}
        {node.menuGroup && (
          <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 sm:inline">
            {node.menuGroup}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onAddChild(node._id)}
            title="Add child"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-900/20"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={() => onEdit(node)}
            title="Edit"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(node)}
            title="Delete"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {sorted.map((child) => (
              <CategoryTreeNode
                key={child._id}
                node={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
