import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, CategoryNode, CategoryFormPayload } from "@/types";
import { flattenTree } from "@/services/category.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  parentId: z.string().optional().nullable(),
  menuGroup: z.string().max(50).optional(),
  menuOrder: z.coerce.number().int().min(0).optional(),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Category | null;
  defaultParentId?: string | null;
  tree: CategoryNode[];
  onSubmit: (payload: CategoryFormPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({ initial, defaultParentId, tree, onSubmit, onCancel, isLoading }: Props) {
  const isEdit = !!initial;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      parentId: initial?.parentId ?? defaultParentId ?? null,
      menuGroup: initial?.menuGroup ?? "",
      menuOrder: initial?.menuOrder ?? 0,
      description: initial?.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? "",
      parentId: initial?.parentId ?? defaultParentId ?? null,
      menuGroup: initial?.menuGroup ?? "",
      menuOrder: initial?.menuOrder ?? 0,
      description: initial?.description ?? "",
    });
  }, [initial, defaultParentId, reset]);

  const flatList = flattenTree(tree).filter((c) => c._id !== initial?._id);

  const submit = (data: FormData) => {
    onSubmit({
      name: data.name,
      parentId: data.parentId || null,
      menuGroup: data.menuGroup || undefined,
      menuOrder: data.menuOrder,
      description: data.description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {/* Name */}
      <Input
        label="Category Name *"
        placeholder="e.g. Dry Food"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* Parent */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Parent Category
        </label>
        <select
          {...register("parentId")}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">— None (top level) —</option>
          {flatList.map((c) => (
            <option key={c._id} value={c._id}>
              {"  ".repeat(c.depth)}
              {c.depth > 0 ? "└ " : ""}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Group */}
      <Input
        label="Menu Group"
        placeholder="e.g. Dogs"
        error={errors.menuGroup?.message}
        {...register("menuGroup")}
      />

      {/* Menu Order */}
      <Input
        label="Menu Order"
        type="number"
        placeholder="0"
        error={errors.menuOrder?.message}
        {...register("menuOrder")}
      />

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Optional description..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isLoading} className="flex-1">
          {isEdit ? "Save Changes" : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
