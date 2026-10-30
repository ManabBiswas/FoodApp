import { authService } from '@/services/api';
import { isUnauthorizedError } from '@/utils/authError';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
  const userRef = useRef<User | null>(null);

  const clearStoredAuth = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'cartData']);
    } catch (error) {
      console.error('Failed to clear stored auth:', error);
    }

    setToken(null);
    setUser(null);
  }, []);

  // Initialize auth state from AsyncStorage on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Fetch stored token and user data
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData'),
        ]);

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser && typeof parsedUser === 'object') {
              setToken(storedToken);
              setUser(parsedUser);
            } else {
              await clearStoredAuth();
            }
          } catch {
            console.warn('Stored user data was corrupt; cleared the local session.');
            await clearStoredAuth();
          }
        }
      } catch (error) {
        console.error('Failed to bootstrap auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [clearStoredAuth]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { token: newToken, ...userData } = response.data;

      if (!newToken) {
        throw new Error('Invalid login response from server');
      }

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
  }, []);

  const signup = useCallback(async (userData: any) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, ...newUser } = response.data;

      if (!newToken) {
        throw new Error('Invalid signup response from server');
      }

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
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        // A rejected logout (for example an expired token) must not trap the
        // user in a signed-in state. Clearing local auth always wins.
        console.warn('Server logout failed; clearing the local session anyway.');
      }
    }

    await clearStoredAuth();
  }, [token, clearStoredAuth]);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await authService.getMe(token);
      const userData = response.data;

      if (!userData?._id) {
        throw new Error('Invalid profile response from server');
      }

      // Update AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Update context
      setUser(userData);
    } catch (error) {
      // An expired or revoked token is unrecoverable: clear the session so the
      // app can redirect to sign-in instead of retrying forever.
      if (isUnauthorizedError(error)) {
        console.warn('Session expired; signing out.');
        await clearStoredAuth();
        return;
      }

      console.error('Failed to refresh user:', error);
    }
  }, [token, clearStoredAuth]);

  const updateUser = useCallback((updates: Partial<User>) => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    userRef.current = updatedUser;
    setUser(updatedUser);

    AsyncStorage.setItem('userData', JSON.stringify(updatedUser)).catch((error) => {
      console.error('Failed to persist user update:', error);
    });
  }, []);

  const value = useMemo<AuthContextType>( // usememo for performance optimization
    () => ({
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
    }),
    [user, token, isLoading, login, signup, logout, refreshUser, updateUser]
  );

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
