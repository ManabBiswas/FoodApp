import { authService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin';
  membershipType: 'regular' | 'gold' | 'platinum';
  isActive: boolean;
}

interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth Methods
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // User Methods
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from AsyncStorage on app launch
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Fetch stored token and user data
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to bootstrap auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { token: newToken, user: userData } = response.data;

      // Store in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('userToken', newToken),
        AsyncStorage.setItem('userData', JSON.stringify(userData)),
      ]);

      // Update context
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, user: newUser } = response.data;

      // Store in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('userToken', newToken),
        AsyncStorage.setItem('userData', JSON.stringify(newUser)),
      ]);

      // Update context
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }

      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem('userToken'),
        AsyncStorage.removeItem('userData'),
      ]);

      // Clear context
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!token) return;

      const response = await authService.getMe(token);
      const userData = response.data;

      // Update AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Update context
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If token is invalid, logout
      if (error instanceof Error && error.message.includes('401')) {
        await logout();
      }
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    refreshUser,
    updateUser,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use Auth context
 * Usage: const { user, token, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
