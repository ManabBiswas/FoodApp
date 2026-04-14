import { cartService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

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
  fetchCart: () => Promise<void>;
  addItem: (foodId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const fetchCart = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await cartService.getCart(token);
      const cartData = response.data || response;
      setCart(cartData);

      // Cache in AsyncStorage
      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (foodId: string, quantity: number) => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await cartService.addItem(
        { foodId, quantity },
        token
      );
      const cartData = response.data || response;
      setCart(cartData);

      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!token) return;

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
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) return;

    try {
      const response = await cartService.removeItem(itemId, token);
      const cartData = response.data || response;
      setCart(cartData);

      await AsyncStorage.setItem('cartData', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!token) return;

    try {
      await cartService.clearCart(token);
      setCart(null);

      await AsyncStorage.removeItem('cartData');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  // Calculate derived values
  const itemCount = cart?.items?.length || 0;
  const total = cart?.subtotal || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    itemCount,
    total,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };

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
