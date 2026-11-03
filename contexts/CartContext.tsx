import { cartService } from '@/services/api';
import { isUnauthorizedError } from '@/utils/authError';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export interface CartTopping {
  name: string;
  price?: number;
}

export interface CartItem {
  _id: string;
  food: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  selectedToppings?: Array<{ name: string; price: number }>;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface CartContextType {
  // State
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  total: number;

  // Cart Methods
  fetchCart: () => Promise<void>; // Fetches cart data as promises and updates state
  addItem: (
    foodId: string,
    quantity: number,
    selectedToppings?: CartTopping[]
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, logout } = useAuth();

  const handleAuthFailure = useCallback(
    async (error: unknown) => {
      if (!isUnauthorizedError(error)) return false;

      console.warn('Cart session expired; signing out.');
      await logout();
      return true;
    },
    [logout]
  );

  const fetchCart = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await cartService.getCart(token);
      const cartData = response.data || response;
      setCart(cartData);

      // Cache in AsyncStorage
      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      if (await handleAuthFailure(error)) return;
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, handleAuthFailure]);

  // Keep the cart in sync with the signed-in user. Logging out (or switching
  // accounts) must never leave the previous user's items in memory.
  useEffect(() => {
    if (!token) {
      setCart(null);
      setIsLoading(false);
      return;
    }

    fetchCart();
  }, [token, fetchCart]);

  const addItem = useCallback(async (
    foodId: string,
    quantity: number,
    selectedToppings?: CartTopping[]
  ) => {
    if (!token) throw new Error('Please sign in to add items to your cart.');

    try {
      setIsLoading(true);
      const response = await cartService.addItem(
        selectedToppings && selectedToppings.length > 0
          ? { foodId, quantity, selectedToppings }
          : { foodId, quantity },
        token
      );
      const cartData = response.data || response;
      setCart(cartData);

      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      if (await handleAuthFailure(error)) throw error;
      console.error('Failed to add item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [token, handleAuthFailure]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!token) throw new Error('Please sign in to update your cart.');

    try {
      const response = await cartService.updateItem(
        itemId,
        { quantity },
        token
      );
      const cartData = response.data || response;
      setCart(cartData);

      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      if (await handleAuthFailure(error)) throw error;
      console.error('Failed to update item:', error);
      throw error;
    }
  }, [token, handleAuthFailure]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!token) throw new Error('Please sign in to update your cart.');

    try {
      const response = await cartService.removeItem(itemId, token);
      const cartData = response.data || response;
      setCart(cartData);

      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      if (await handleAuthFailure(error)) throw error;
      console.error('Failed to remove item:', error);
      throw error;
    }
  }, [token, handleAuthFailure]);

  const clearCart = useCallback(async () => {
    if (!token) throw new Error('Please sign in to clear your cart.');

    try {
      await cartService.clearCart(token);
      setCart(null);

      await AsyncStorage.removeItem('cartData');
    } catch (error) {
      if (await handleAuthFailure(error)) throw error;
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }, [token, handleAuthFailure]);

  // Calculate derived values
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const total = cart?.subtotal || 0;

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      isLoading,
      itemCount,
      total,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [cart, isLoading, itemCount, total, fetchCart, addItem, updateItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Custom hook to use Cart context
 * Usage: const { cart, itemCount, addItem } = useCart();
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
