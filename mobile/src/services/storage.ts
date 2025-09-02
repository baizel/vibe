// src/services/storage.ts - Cross-platform storage service
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting storage item ${key}:`, error);
    }
  }
  
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error getting storage item ${key}:`, error);
      return null;
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing storage item ${key}:`, error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
  
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting storage object ${key}:`, error);
    }
  }
  
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting storage object ${key}:`, error);
      return null;
    }
  }
}

export const storageService = StorageService.getInstance();

// Storage keys
export const STORAGE_KEYS = {
  CART_STATE: 'cart_state',
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
} as const;