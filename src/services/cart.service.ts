import apiClient from "@/lib/axios";
import { CartApiResponse, CartValidateResponse } from "@/types";

// Guest token stored in localStorage for anonymous carts
const GUEST_TOKEN_KEY = "cartGuestToken";

export function getGuestToken(): string {
  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

export function clearGuestToken() {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}

/** Build headers: if user is logged in (accessToken present), rely on Bearer
 *  (already injected by axios interceptor). Otherwise send x-cart-token. */
function guestHeaders(): Record<string, string> {
  const hasAuth = !!localStorage.getItem("accessToken");
  if (hasAuth) return {};
  return { "x-cart-token": getGuestToken() };
}

export const cartService = {
  async getCart(): Promise<CartApiResponse> {
    const { data } = await apiClient.get<{ cart: CartApiResponse }>("/cart", {
      headers: guestHeaders(),
    });
    return data.cart;
  },

  async addItem(productId: string, quantity: number): Promise<CartApiResponse> {
    const { data } = await apiClient.post<{ cart: CartApiResponse }>(
      "/cart/items",
      { productId, quantity },
      { headers: guestHeaders() }
    );
    return data.cart;
  },

  async updateItem(productId: string, quantity: number): Promise<CartApiResponse> {
    const { data } = await apiClient.patch<{ cart: CartApiResponse }>(
      `/cart/items/${productId}`,
      { quantity },
      { headers: guestHeaders() }
    );
    return data.cart;
  },

  async removeItem(productId: string): Promise<CartApiResponse> {
    const { data } = await apiClient.delete<{ cart: CartApiResponse }>(
      `/cart/items/${productId}`,
      { headers: guestHeaders() }
    );
    return data.cart;
  },

  async clearCart(): Promise<CartApiResponse> {
    const { data } = await apiClient.delete<{ cart: CartApiResponse }>("/cart", {
      headers: guestHeaders(),
    });
    return data.cart;
  },

  async validateCart(): Promise<CartValidateResponse> {
    const { data } = await apiClient.post<CartValidateResponse>(
      "/cart/validate",
      {},
      { headers: guestHeaders() }
    );
    return data;
  },

  async mergeCart(guestToken: string): Promise<CartApiResponse> {
    const { data } = await apiClient.post<{ cart: CartApiResponse }>(
      "/cart/merge",
      { guestToken }
    );
    return data.cart;
  },
};
