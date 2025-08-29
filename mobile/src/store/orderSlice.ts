// src/store/orderSlice.ts - Orders State Management
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orderAPI } from "../services/api";

interface Order {
  id: string;
  items: Array<{
    product: any;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "prepared"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  deliveryDate: string;
  address: any;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderData: any) => {
    const response = await orderAPI.createOrder(orderData);
    return response;
  }
);

export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
  const response = await orderAPI.getOrders();
  return response;
});

export const fetchOrder = createAsyncThunk(
  "orders/fetchOne",
  async (orderId: string) => {
    const response = await orderAPI.getOrder(orderId);
    return response;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create order";
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch orders";
      })
      // Fetch Single Order
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
