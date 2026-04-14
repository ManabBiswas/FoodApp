import { images } from '@/constants';
import { cartService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CartItem {
  _id: string;
  food: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  selectedToppings?: { name: string; price: number }[];
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

const DELIVERY_CHARGE = 50;
const TAX_RATE = 0.05;

const Cart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/(auth)/Signin');
        return;
      }
      const response = await cartService.getCart(token);
      setCart(response.data || response);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCart().finally(() => setRefreshing(false));
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await cartService.updateItem(itemId, { quantity: newQuantity }, token);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await cartService.removeItem(itemId, token);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const calculateItemPrice = (item: CartItem) => {
    const foodPrice = (item.food?.price || 0) * item.quantity;
    const toppingsPrice = (item.selectedToppings || []).reduce(
      (sum, top) => sum + (top.price || 0),
      0
    ) * item.quantity;
    return foodPrice + toppingsPrice;
  };

  const subtotal =
    cart?.items?.reduce((sum, item) => sum + calculateItemPrice(item), 0) || 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_CHARGE;

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItems.has(item._id);
    const itemPrice = calculateItemPrice(item);

    return (
      <View className="border-b border-gray-200 px-4 py-4">
        <View className="flex-row gap-3">
          {/* Food Image */}
          <View className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              source={
                item.food?.image
                  ? { uri: item.food.image }
                  : images.person
              }
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Food Details */}
          <View className="flex-1">
            <Text className="text-base font-quicksand-bold text-gray-800 mb-1">
              {item.food?.name || 'Unknown Item'}
            </Text>

            {/* Price per item */}
            <Text className="text-sm font-quicksand-medium text-gray-600 mb-2">
              ₹{item.food?.price?.toFixed(2) || '0.00'} each
            </Text>

            {/* Toppings */}
            {item.selectedToppings && item.selectedToppings.length > 0 && (
              <Text className="text-xs text-gray-500 mb-2">
                + {item.selectedToppings.map((t) => t.name).join(', ')}
              </Text>
            )}

            {/* Quantity Control */}
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() =>
                  handleUpdateQuantity(item._id, item.quantity - 1)
                }
                disabled={isUpdating}
                className="w-7 h-7 bg-red-100 rounded-full items-center justify-center"
              >
                <Text className="text-red-500 font-bold">−</Text>
              </TouchableOpacity>

              <Text className="w-6 text-center font-quicksand-bold text-gray-800">
                {isUpdating ? '...' : item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  handleUpdateQuantity(item._id, item.quantity + 1)
                }
                disabled={isUpdating}
                className="w-7 h-7 bg-green-100 rounded-full items-center justify-center"
              >
                <Text className="text-green-500 font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price & Remove */}
          <View className="items-end justify-between">
            <Text className="text-base font-quicksand-bold text-gray-800">
              ₹{itemPrice.toFixed(2)}
            </Text>

            <TouchableOpacity
              onPress={() => handleRemoveItem(item._id)}
              disabled={isUpdating}
              className="px-2 py-1 bg-red-50 rounded"
            >
              <Text className="text-red-500 text-xs font-quicksand-semibold">
                {isUpdating ? 'Removing...' : 'Remove'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Empty Cart State
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-600 font-quicksand-medium">
          Loading cart...
        </Text>
      </SafeAreaView>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 items-center justify-center px-4">
            <Image
              source={images.bag}
              className="w-24 h-24 mb-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-quicksand-bold text-gray-800 mb-2">
              Your Cart is Empty
            </Text>
            <Text className="text-center text-gray-600 font-quicksand-regular mb-6">
              Add some delicious items to your cart and get them delivered to you
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/Index')}
              className="bg-red-500 px-8 py-3 rounded-2xl"
            >
              <Text className="text-white font-quicksand-bold text-center">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Cart with Items
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 flex-col">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-200">
          <Text className="text-2xl font-quicksand-bold text-gray-800">
            Shopping Cart
          </Text>
          <Text className="text-sm text-gray-600 font-quicksand-regular">
            {cart.totalItems} items
          </Text>
        </View>

        {/* Cart Items List */}
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item._id}
          renderItem={renderCartItem}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {/* Pricing Summary and Checkout */}
        <View className="px-4 py-4 border-t border-gray-200">
          {/* Price Breakdown */}
          <View className="mb-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-quicksand-regular">
                Subtotal
              </Text>
              <Text className="text-gray-800 font-quicksand-semibold">
                ₹{subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-quicksand-regular">
                Tax (5%)
              </Text>
              <Text className="text-gray-800 font-quicksand-semibold">
                ₹{tax.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-quicksand-regular">
                Delivery Charge
              </Text>
              <Text className="text-gray-800 font-quicksand-semibold">
                ₹{DELIVERY_CHARGE.toFixed(2)}
              </Text>
            </View>

            <View className="border-t border-gray-200 pt-3 flex-row justify-between">
              <Text className="text-lg font-quicksand-bold text-gray-800">
                Total
              </Text>
              <Text className="text-lg font-quicksand-bold text-red-500">
                ₹{total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/Index')}
              className="flex-1 border-2 border-red-500 py-3 rounded-2xl"
            >
              <Text className="text-red-500 font-quicksand-bold text-center">
                Continue Shopping
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-red-500 py-3 rounded-2xl">
              <Text className="text-white font-quicksand-bold text-center">
                Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Cart;