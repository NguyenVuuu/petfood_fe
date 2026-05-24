import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
}

const loadWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem("wishlist");
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: WishlistItem[]) => {
  localStorage.setItem("wishlist", JSON.stringify(items));
};

const initialState: WishlistState = { items: loadWishlist() };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex(
        (i) => i.productId === action.payload.productId
      );
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
      saveWishlist(state.items);
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveWishlist(state.items);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
