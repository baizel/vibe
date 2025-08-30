// src/context/AuthContext.tsx - Simple Context (No Authentication)
import React, { createContext, useContext, useState } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'customer' | 'driver' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Simple MVP - no authentication, always guest user
  const [user] = useState<User | null>(null);
  const [isLoading] = useState(false);
  const [isAuthenticated] = useState(false);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User };