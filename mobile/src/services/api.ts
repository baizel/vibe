// src/services/api.ts - API Service Layer
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = __DEV__
  ? "http://localhost:8080/api"
  : "https://your-domain.com/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      SecureStore.deleteItemAsync("token");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }).then((res) => res.data),

  register: (userData: any) =>
    apiClient.post("/auth/register", userData).then((res) => res.data),

  refreshToken: () => apiClient.post("/auth/refresh").then((res) => res.data),
};

export const productAPI = {
  getProducts: () => apiClient.get("/products").then((res) => res.data),

  getProduct: (id: string) =>
    apiClient.get(`/products/${id}`).then((res) => res.data),

  getCategories: () =>
    apiClient.get("/products/categories").then((res) => res.data),

  searchProducts: (query: string) =>
    apiClient.get(`/products/search?q=${query}`).then((res) => res.data),
};

export const orderAPI = {
  createOrder: (orderData: any) =>
    apiClient.post("/orders", orderData).then((res) => res.data),

  getOrders: () => apiClient.get("/orders").then((res) => res.data),

  getOrder: (id: string) =>
    apiClient.get(`/orders/${id}`).then((res) => res.data),

  trackOrder: (id: string) =>
    apiClient.get(`/orders/${id}/track`).then((res) => res.data),

  cancelOrder: (id: string) =>
    apiClient.put(`/orders/${id}/cancel`).then((res) => res.data),
};

export const driverAPI = {
  getRoutes: (date: string) =>
    apiClient.get(`/driver/routes/${date}`).then((res) => res.data),

  startRoute: (routeId: string) =>
    apiClient.put(`/driver/routes/${routeId}/start`).then((res) => res.data),

  updateOrderStatus: (orderId: string, status: string) =>
    apiClient
      .put(`/driver/orders/${orderId}/status`, { status })
      .then((res) => res.data),

  updateLocation: (latitude: number, longitude: number) =>
    apiClient
      .post("/driver/location", { latitude, longitude })
      .then((res) => res.data),
};

export default apiClient;
