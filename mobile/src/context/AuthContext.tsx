// src/context/AuthContext.tsx - Authentication Context
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../services/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "driver" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      await SecureStore.setItemAsync("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      await SecureStore.setItemAsync("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
