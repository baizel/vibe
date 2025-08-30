// src/services/api.ts - API Service Layer
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = __DEV__
  ? "http://localhost:8080/api"
  : "https://your-domain.com/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Token retrieval failed:", error);
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect to login
      try {
        await SecureStore.deleteItemAsync("token");
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("authProvider");
      } catch (e) {
        console.log("Error clearing auth data:", e);
      }
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: (email: string, password: string) =>
    Promise.resolve({
      token: "mock-jwt-token",
      user: {
        id: "user-1",
        email: email,
        firstName: "John",
        lastName: "Doe",
        role: "customer",
      },
    }),

  register: (userData: any) =>
    Promise.resolve({
      token: "mock-jwt-token",
      user: {
        id: "user-new",
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "customer",
      },
    }),

  refreshToken: () => Promise.resolve({ token: "new-mock-jwt-token" }),
};

export const productAPI = {
  getProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },

  searchProducts: async (query: string) => {
    const response = await apiClient.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export const orderAPI = {
  createOrder: async (orderData: any) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.warn('Failed to create order via backend, using mock:', error);
      const mockOrder = {
        id: `order-${Date.now()}`,
        ...orderData,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      return mockOrder;
    }
  },

  getOrders: async () => {
    try {
      const response = await apiClient.get('/orders');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch orders from backend:', error);
      return [];
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch order from backend, using mock:', error);
      return {
        id,
        status: "pending",
        items: [],
        totalAmount: 0,
        createdAt: new Date().toISOString(),
      };
    }
  },

  trackOrder: async (id: string) => {
    try {
      const response = await apiClient.get(`/orders/${id}/track`);
      return response.data;
    } catch (error) {
      console.warn('Failed to track order via backend, using mock:', error);
      return {
        orderId: id,
        status: "pending",
        location: null,
        estimatedDelivery: null,
      };
    }
  },

  cancelOrder: async (id: string) => {
    try {
      const response = await apiClient.patch(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.warn('Failed to cancel order via backend, using mock:', error);
      return { success: true, orderId: id };
    }
  },
};

export const driverAPI = {
  getRoutes: (date: string) => Promise.resolve([]),

  startRoute: (routeId: string) => Promise.resolve({ success: true, routeId }),

  updateOrderStatus: (orderId: string, status: string) =>
    Promise.resolve({ success: true, orderId, status }),

  updateLocation: (latitude: number, longitude: number) =>
    Promise.resolve({ success: true }),
};

export default apiClient;
