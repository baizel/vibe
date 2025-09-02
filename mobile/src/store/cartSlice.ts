// src/store/cartSlice.ts - Cart State Management with Persistence
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { storageService, STORAGE_KEYS } from "../services/storage";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  isLoaded: boolean; // Track if cart has been loaded from storage
}

const initialState: CartState = {
  items: [],
  total: 0,
  isLoaded: false,
};

// Helper function to calculate total
const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
};

// Helper function to save cart state to storage
const saveCartToStorage = async (state: CartState) => {
  try {
    const cartData = {
      items: state.items,
      total: state.total,
    };
    await storageService.setObject(STORAGE_KEYS.CART_STATE, cartData);
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Load cart state from storage
    loadCartFromStorage: (state, action: PayloadAction<{ items: CartItem[]; total: number } | null>) => {
      if (action.payload) {
        state.items = action.payload.items;
        state.total = calculateTotal(action.payload.items); // Recalculate to ensure consistency
      }
      state.isLoaded = true;
    },

    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>
    ) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      state.total = calculateTotal(state.items);
      
      // Save to storage asynchronously
      if (state.isLoaded) {
        saveCartToStorage(state);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      state.total = calculateTotal(state.items);
      
      // Save to storage asynchronously
      if (state.isLoaded) {
        saveCartToStorage(state);
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.product.id !== productId
          );
        } else {
          item.quantity = quantity;
        }
      }

      state.total = calculateTotal(state.items);
      
      // Save to storage asynchronously
      if (state.isLoaded) {
        saveCartToStorage(state);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      
      // Save to storage asynchronously
      if (state.isLoaded) {
        saveCartToStorage(state);
      }
    },
  },
});

export const { loadCartFromStorage, addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
