/**
 * Authentication Context
 * Provides authentication state and methods to the entire application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentUser,
  logout as logoutService,
  verifySession,
  type User,
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserInternal] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper to add logging
  const setUser = (newUser: User | null) => {
    console.log('🔐 AuthContext.setUser called:', {
      previous: user?.role,
      new: newUser?.role,
      newUserFull: newUser
    });
    setUserInternal(newUser);
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current user from Supabase session
        const currentUser = await getCurrentUser();
        
        console.log('🔐 AuthContext initialization:', currentUser);
        
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if logout API call fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const verifiedUser = await verifySession();
      setUser(verifiedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If session verification fails, try to get current user from session
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (getUserError) {
        console.error('Failed to get current user:', getUserError);
        setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
