import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface UserData {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  provider: string;
}

class TokenService {
  private static instance: TokenService;
  
  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  // Platform-specific secure storage
  private async setSecureItem(key: string, value: string): Promise<void> {
    if (!value || typeof value !== 'string') {
      throw new Error(`Invalid value for ${key}: must be a non-empty string`);
    }
    
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web as SecureStore has limited support
      await AsyncStorage.setItem(`secure_${key}`, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  private async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(`secure_${key}`);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  private async deleteSecureItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(`secure_${key}`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  // Save authentication tokens
  async saveTokens(tokenData: TokenData): Promise<void> {
    try {
      if (!tokenData.accessToken) {
        throw new Error("Access token is required");
      }

      await this.setSecureItem("accessToken", tokenData.accessToken);
      
      if (tokenData.refreshToken) {
        await this.setSecureItem("refreshToken", tokenData.refreshToken);
      }
      
      if (tokenData.expiresAt) {
        await AsyncStorage.setItem("tokenExpiresAt", tokenData.expiresAt.toString());
      }
      
      if (tokenData.tokenType) {
        await AsyncStorage.setItem("tokenType", tokenData.tokenType);
      }
    } catch (error) {
      console.error("Failed to save tokens:", error);
      throw error;
    }
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await this.getSecureItem("accessToken");
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await this.getSecureItem("refreshToken");
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  }

  // Check if token is expired
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiresAt = await AsyncStorage.getItem("tokenExpiresAt");
      if (!expiresAt) {
        return false; // If no expiry time, assume valid
      }
      
      const expiryTime = parseInt(expiresAt, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Consider token expired if it expires within the next 5 minutes
      return currentTime >= (expiryTime - 300);
    } catch (error) {
      console.error("Failed to check token expiry:", error);
      return true; // Assume expired on error
    }
  }

  // Save user data
  async saveUser(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("authProvider", userData.provider);
    } catch (error) {
      console.error("Failed to save user data:", error);
      throw error;
    }
  }

  // Get user data
  async getUser(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  }

  // Get auth provider
  async getAuthProvider(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authProvider");
    } catch (error) {
      console.error("Failed to get auth provider:", error);
      return null;
    }
  }

  // Clear all authentication data
  async clearAuth(): Promise<void> {
    try {
      await this.deleteSecureItem("accessToken");
      await this.deleteSecureItem("refreshToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("authProvider");
      await AsyncStorage.removeItem("tokenExpiresAt");
      await AsyncStorage.removeItem("tokenType");
      
      // Clear legacy tokens
      await AsyncStorage.removeItem("userToken");
      await this.deleteSecureItem("token");
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const user = await this.getUser();
      
      if (!accessToken || !user) {
        return false;
      }
      
      // Check if token is expired
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        // Try to refresh token
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          // Token refresh will be handled by axios interceptor
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      return false;
    }
  }

  // Parse JWT token to get expiry time
  parseJWT(token: string): any {
    try {
      if (!token || typeof token !== 'string') {
        console.warn('Invalid token provided to parseJWT');
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT format');
        return null;
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return null;
    }
  }

  // Save tokens with automatic expiry calculation
  async saveTokensWithExpiry(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const decoded = this.parseJWT(accessToken);
      const expiresAt = decoded?.exp;
      
      await this.saveTokens({
        accessToken,
        refreshToken,
        expiresAt,
        tokenType: 'Bearer'
      });
    } catch (error) {
      console.error("Failed to save tokens with expiry:", error);
      throw error;
    }
  }
}

export const tokenService = TokenService.getInstance();
export default tokenService;