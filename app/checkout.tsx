import { images } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { orderService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DELIVERY_CHARGE = 50;
const TAX_RATE = 0.05;

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash on Delivery', icon: '💵' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['id'];

export default function Checkout() {
  const { token, user } = useAuth();
  const { cart, clearCart } = useCart();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const items = cart?.items || [];
  const itemsPrice = items.reduce((sum, item) => {
    const toppings = (item.selectedToppings || []).reduce(
      (topSum, top) => topSum + (top.price || 0),
      0
    );
    return sum + (item.food?.price || 0) * item.quantity + toppings * item.quantity;
  }, 0);
  const taxPrice = itemsPrice * TAX_RATE;
  const totalPrice = itemsPrice + taxPrice + DELIVERY_CHARGE;

  const validate = () => {
    if (!items.length) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out.');
      return false;
    }
    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      Alert.alert('Missing Address', 'Please fill in your complete delivery address.');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (!token) {
      Alert.alert('Session expired', 'Please sign in again.');
      router.replace('/(auth)/Signin');
      return;
    }

    try {
      setLoading(true);

      const orderItems = items.map((item) => ({
        food: item.food._id,
        name: item.food.name,
        quantity: item.quantity,
        price: item.food.price,
        image: item.food.image,
        selectedToppings: item.selectedToppings || [],
      }));

      const response = await orderService.createOrder(
        {
          orderItems,
          deliveryAddress: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: country.trim(),
          },
          paymentMethod,
          itemsPrice,
          taxPrice,
          deliveryFee: DELIVERY_CHARGE,
          totalPrice,
          specialInstructions: specialInstructions.trim(),
        },
        token
      );

      if (response.status === 'success') {
        await clearCart();
        Alert.alert(
          'Order Placed',
          'Your order has been placed successfully.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/Index') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Order Failed', error.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Image source={images.arrowBack} className="size-5" resizeMode="contain" tintColor="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-quicksand-bold text-gray-800">Checkout</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Order Summary */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-quicksand-bold text-gray-800 mb-3">
            Order Summary
          </Text>
          {items.map((item) => (
            <View
              key={item._id}
              className="flex-row justify-between items-center mb-2"
            >
              <Text className="font-quicksand-medium text-gray-700 flex-1" numberOfLines={1}>
                {item.food?.name} × {item.quantity}
              </Text>
              <Text className="font-quicksand-semibold text-gray-800">
                ₹{((item.food?.price || 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View className="border-t border-gray-200 mt-3 pt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="font-quicksand-regular text-gray-600">Items</Text>
              <Text className="font-quicksand-semibold text-gray-800">₹{itemsPrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="font-quicksand-regular text-gray-600">Tax (5%)</Text>
              <Text className="font-quicksand-semibold text-gray-800">₹{taxPrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="font-quicksand-regular text-gray-600">Delivery</Text>
              <Text className="font-quicksand-semibold text-gray-800">₹{DELIVERY_CHARGE.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
              <Text className="text-lg font-quicksand-bold text-gray-800">Total</Text>
              <Text className="text-lg font-quicksand-bold text-red-500">₹{totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-quicksand-bold text-gray-800 mb-3">
            Delivery Address
          </Text>
          {user && (
            <Text className="text-sm font-quicksand-regular text-gray-500 mb-2">
              Delivering to {user.name}
            </Text>
          )}
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="Street address"
            placeholderTextColor="#9CA3AF"
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="City"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="State"
            placeholderTextColor="#9CA3AF"
            value={state}
            onChangeText={setState}
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="Zip code"
            placeholderTextColor="#9CA3AF"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="Country"
            placeholderTextColor="#9CA3AF"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        {/* Payment Method */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-quicksand-bold text-gray-800 mb-3">
            Payment Method
          </Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setPaymentMethod(method.id)}
              className={`flex-row items-center px-4 py-3 rounded-xl mb-2 border ${
                paymentMethod === method.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="text-xl mr-3">{method.icon}</Text>
              <Text className="font-quicksand-semibold text-gray-800 flex-1">
                {method.label}
              </Text>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  paymentMethod === method.id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {paymentMethod === method.id && (
                  <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Instructions */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-quicksand-bold text-gray-800 mb-3">
            Special Instructions
          </Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 font-quicksand-medium text-gray-800"
            placeholder="Optional notes for the restaurant"
            placeholderTextColor="#9CA3AF"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Place Order */}
        <View className="px-4 mt-8">
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            className="bg-red-500 rounded-2xl py-4 items-center"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-quicksand-bold">
                Place Order · ₹{totalPrice.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
