import apiClient from "@/lib/axios";
import { Product } from "@/types";

export interface WishlistApiItem {
  productId: string;
  product: Product;
}

export interface WishlistApiResponse {
  id: string;
  userId: string;
  productIds: string[];
  items: WishlistApiItem[];
  total: number;
}

export interface WishlistCheckResponse {
  userId: string;
  productId: string;
  isFavorited: boolean;
}

export const wishlistService = {
  /** GET /users/me/wishlist */
  async getMyWishlist(): Promise<WishlistApiResponse> {
    const { data } = await apiClient.get<WishlistApiResponse>("/users/me/wishlist");
    return data;
  },

  /** POST /users/me/wishlist/items  body: { productId } */
  async addToWishlist(productId: string): Promise<void> {
    await apiClient.post("/users/me/wishlist/items", { productId });
  },

  /** DELETE /users/me/wishlist/items/:productId */
  async removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete(`/users/me/wishlist/items/${productId}`);
  },

  /** GET /users/me/wishlist/check/:productId */
  async checkWishlist(productId: string): Promise<WishlistCheckResponse> {
    const { data } = await apiClient.get<WishlistCheckResponse>(
      `/users/me/wishlist/check/${productId}`
    );
    return data;
  },
};
