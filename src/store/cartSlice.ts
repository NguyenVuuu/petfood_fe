import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
}

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const initialState: CartState = { items: loadCart() };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (existing) {
        const newQty = Math.min(
          existing.quantity + action.payload.quantity,
          existing.stock
        );
        existing.quantity = newQty;
      } else {
        state.items.push(action.payload);
      }
      saveCart(state.items);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveCart(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (item) {
        item.quantity = Math.max(
          1,
          Math.min(action.payload.quantity, item.stock)
        );
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
