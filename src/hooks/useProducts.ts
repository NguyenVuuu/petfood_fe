import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { ProductListParams } from "@/types";

export const PRODUCTS_KEY = "products";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => productService.listProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => productService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success("Product created successfully! 🎉");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      productService.updateProduct(id, formData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, id] });
      toast.success("Product updated successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message ?? "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success("Product deleted.");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });
}
