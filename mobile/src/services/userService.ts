import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://your-domain.com/api';

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
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Token retrieval failed:', error);
  }
  return config;
});

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'driver' | 'admin';
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

class UserService {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Fallback to stored user data
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put('/users/profile', data);
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async uploadProfilePicture(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiClient.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.pictureUrl;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/users/profile');
      
      // Clear all stored data
      await SecureStore.deleteItemAsync('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authProvider');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }
}

export default new UserService();