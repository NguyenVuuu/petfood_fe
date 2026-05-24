import apiClient from "@/lib/axios";
import { Product, ProductListParams, ProductListResponse } from "@/types";

export const productService = {
  async listProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
    const { data } = await apiClient.get<ProductListResponse>("/products", {
      params,
    });
    return data;
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<{ product: Product }>(
      `/products/${id}`
    );
    return data.product;
  },

  async createProduct(formData: FormData): Promise<Product> {
    const { data } = await apiClient.post<{ product: Product }>(
      "/products",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.product;
  },

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const { data } = await apiClient.put<{ product: Product }>(
      `/products/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
