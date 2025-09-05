import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import firebaseAuth, { AuthUser } from '../services/firebaseAuth';
import { tokenService, UserData } from '../services/tokenService';
import { auth } from '../config/firebase';

interface User extends UserData {
  // Additional properties if needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from stored data
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const isAuthenticated = await tokenService.isAuthenticated();
        if (isAuthenticated) {
          const userData = await tokenService.getUser();
          if (userData) {
            setUser(userData as User);
          } else {
            // Clear invalid auth state
            await tokenService.clearAuth();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        await tokenService.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Also listen to Firebase auth state changes as backup
    const unsubscribe = firebaseAuth.onAuthStateChanged(
      async (firebaseUser: any) => {
        // Only handle this if we don't already have a user from token service
        if (!user && firebaseUser) {
          // This might happen if Firebase auth state persists but our tokens are lost
          // In this case, we should try to re-authenticate with the backend
          console.log('Firebase user found without local session, attempting to sync...');
          try {
            const userData = await tokenService.getUser();
            if (!userData) {
              // We have Firebase auth but no backend session - clear Firebase auth silently
              // Clear local storage first to avoid triggering logout API
              await tokenService.clearAuth();
              
              // Then sign out from Firebase directly without calling backend
              await signOut(auth);
            }
          } catch (error) {
            console.error('Failed to sync Firebase auth state:', error);
          }
        } else if (!firebaseUser && user) {
          // Firebase signed out but we still have local session - clear everything
          await tokenService.clearAuth();
          setUser(null);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await firebaseAuth.signInWithEmail(email, password);
      setUser(userData as User);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await firebaseAuth.signUpWithEmail(email, password);
      setUser(userData as User);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await firebaseAuth.signInWithGoogle();
      setUser(userData as User);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseAuth.signOut();
      setUser(null);
    } catch (error) {
      console.error('AuthContext signOut error:', error);
      // Even if signout fails, clear local state
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    await firebaseAuth.sendPasswordResetEmail(email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendPasswordResetEmail,
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