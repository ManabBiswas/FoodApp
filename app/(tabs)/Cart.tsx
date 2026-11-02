import { images } from '@/constants';
import { CartItemSkeleton, Skeleton } from '@/components/Skeleton';
import { CartItem, useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DELIVERY_CHARGE = 50;
const TAX_RATE = 0.05;

const Cart = () => {
  const { cart, isLoading, itemCount, fetchCart, updateItem, removeItem } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart().finally(() => setRefreshing(false));
  }, [fetchCart]);

  const handleUpdateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      await updateItem(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [updateItem]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [removeItem]);

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

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-4 border-b border-gray-200">
          <Text className="text-2xl font-quicksand-bold text-gray-800">
            Shopping Cart
          </Text>
          <Skeleton className="h-3 w-20 rounded-full mt-2" />
        </View>

        <View className="flex-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </View>

        <View className="px-4 py-4 border-t border-gray-200">
          <View className="gap-y-3 mb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} className="flex-row justify-between">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </View>
            ))}
            <View className="border-t border-gray-200 pt-3 flex-row justify-between items-center">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </View>
          </View>

          <View className="flex-row gap-3">
            <Skeleton className="w-[48%] h-12 rounded-2xl" />
            <Skeleton className="w-[48%] h-12 rounded-2xl" />
          </View>
        </View>
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
              source={images.emptyState}
              style={{ width: 240, height: 180 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-quicksand-bold text-gray-800 mt-2 mb-2">
              Your Cart is Empty
            </Text>
            <Text className="text-center text-gray-600 font-quicksand-regular mb-7 px-6">
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
            {itemCount} items
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

            <TouchableOpacity
              onPress={() => router.push('/checkout')}
              className="flex-1 bg-red-500 py-3 rounded-2xl"
            >
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