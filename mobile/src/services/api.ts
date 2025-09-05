// src/services/api.ts - API Service Layer
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (__DEV__) {
    // Try different sources for the API URL in order of preference:
    // 1. Expo config extra
    // 2. Expo's built-in debugger host detection
    // 3. Fallback to localhost
    
    if (Constants.expoConfig?.extra?.apiUrl) {
      return Constants.expoConfig.extra.apiUrl;
    }
    
    // Use Expo's built-in host detection when using --lan
    if (Constants.debuggerHost) {
      const hostWithoutPort = Constants.debuggerHost.split(':')[0];
      return `http://${hostWithoutPort}:8080/api`;
    }
    
    return "http://localhost:8080/api";
  }
  return "https://your-domain.com/api";
};

const BASE_URL = getBaseUrl();

// Log the API URL for debugging
if (__DEV__) {
  console.debug(`🌐 API Base URL: ${BASE_URL}`);
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Token retrieval failed:", error);
  }

  // Log the full request URL for debugging
  if (__DEV__) {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.debug(`📡 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
  }
  
  return config;
});

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in debug mode
    if (__DEV__) {
      console.debug(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()}`);
    }
    return response;
  },
  async (error) => {
    // Log failed requests
    if (error.response) {
      console.warn(`❌ API Error: ${error.response.status} ${error.config?.method?.toUpperCase()}`);
    } else if (error.request) {
      console.warn(`🔌 Network Error: ${error.config?.method?.toUpperCase()} - No response received`);
    } else {
      console.warn(`⚠️ Request Setup Error: ${error.message}`);
    }
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (refreshToken) {
          // Try to refresh the token
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          
          // Save new tokens
          await SecureStore.setItemAsync("accessToken", accessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync("refreshToken", newRefreshToken);
          }
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        // Clear all auth data and redirect to login
        await clearAuthData();
      }
      
      // If refresh failed or no refresh token, clear auth data
      await clearAuthData();
    }
    
    return Promise.reject(error);
  }
);

// Helper function to clear all authentication data
const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("authProvider");
    await AsyncStorage.removeItem("userToken"); // Legacy token key
  } catch (e) {
    console.log("Error clearing auth data:", e);
  }
};


export const authAPI = {
  // Email/Password Login
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.warn('Failed to login via backend:', error);
      throw error;
    }
  },

  // Email/Password Registration
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.warn('Failed to register via backend:', error);
      throw error;
    }
  },

  // Firebase/Google Authentication
  firebaseAuth: async (idToken: string, provider: 'google' | 'firebase') => {
    try {
      const response = await apiClient.post('/auth/firebase', { 
        idToken, 
        provider 
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to authenticate with Firebase token:', error);
      throw error;
    }
  },

  // Google Sign-In specific
  googleAuth: async (googleAuthRequest: any) => {
    try {
      const response = await apiClient.post('/auth/google', googleAuthRequest);
      return response.data;
    } catch (error) {
      console.warn('Failed to authenticate with Google:', error);
      throw error;
    }
  },

  // Token Refresh
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.warn('Failed to refresh token:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.warn('Failed to logout via backend:', error);
      // Even if backend logout fails, we'll clear local storage
      return { success: true };
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.warn('Failed to verify token:', error);
      throw error;
    }
  },
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
