import { AddressCardSkeleton } from '@/components/Skeleton';
import { images } from '@/constants';
import { Address, useAddress } from '@/contexts/AddressContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWallet } from '@/contexts/WalletContext';
import { orderService } from '@/services/api';
import { showAlert } from '@/utils/alert';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  const {
    addresses,
    defaultAddress,
    isLoading: addressesLoading,
  } = useAddress();
  const { balance, refreshWallet } = useWallet();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressTouched, setAddressTouched] = useState(false);
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

  // Pre-fill the default saved address once it is available. Typing or picking
  // another address opts out so a late refresh cannot overwrite user input.
  useEffect(() => {
    if (addressTouched) return;

    const preferred = defaultAddress ?? addresses[0];
    if (!preferred) return;

    setStreet(preferred.street);
    setCity(preferred.city);
    setState(preferred.state);
    setZipCode(preferred.zipCode);
    setCountry(preferred.country);
    setSelectedAddressId(preferred._id);
  }, [addressTouched, addresses, defaultAddress]);

  const applySavedAddress = (address: Address) => {
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
    setCountry(address.country);
    setSelectedAddressId(address._id);
    setAddressTouched(true);
  };

  const useNewAddress = () => {
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('India');
    setSelectedAddressId(null);
    setAddressTouched(true);
  };

  const changeField =
    (setter: (value: string) => void) => (value: string) => {
      setter(value);
      setSelectedAddressId(null);
      setAddressTouched(true);
    };

  const validate = () => {
    if (!items.length) {
      showAlert('Empty Cart', 'Add items to your cart before checking out.');
      return false;
    }
    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      showAlert('Missing Address', 'Please fill in your complete delivery address.');
      return false;
    }
    if (paymentMethod === 'wallet' && balance < totalPrice) {
      showAlert(
        'Insufficient Balance',
        `Your wallet balance is ₹${balance.toFixed(2)}. Add money or choose another payment method.`
      );
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (!token) {
      showAlert('Session expired', 'Please sign in again.');
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
        // The order already exists at this point. A failed cart clear or wallet
        // refresh must not turn a successful order into an error dialog.
        try {
          await clearCart();
        } catch (cartError) {
          console.warn('Order placed but the cart could not be cleared:', cartError);
        }

        await refreshWallet().catch((walletError) => {
          console.warn('Order placed but the wallet could not be refreshed:', walletError);
        });

        showAlert(
          'Order Placed',
          'Your order has been placed successfully.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/Index') }]
        );
      }
    } catch (error: any) {
      showAlert('Order Failed', error.message || 'Failed to place order. Try again.');
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
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-quicksand-bold text-gray-800">
              Delivery Address
            </Text>
            <TouchableOpacity onPress={() => router.push('/addresses')}>
              <Text className="text-sm font-quicksand-semibold text-red-500">
                Manage
              </Text>
            </TouchableOpacity>
          </View>

          {addressesLoading ? (
            <View>
              <AddressCardSkeleton />
              <AddressCardSkeleton />
            </View>
          ) : addresses.length > 0 ? (
            <View className="mb-2">
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address._id;

                return (
                  <TouchableOpacity
                    key={address._id}
                    onPress={() => applySavedAddress(address)}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-4 mb-2 border ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center">
                        <Text className="font-quicksand-bold text-gray-800 capitalize">
                          {address.label}
                        </Text>
                        {address.isDefault && (
                          <View className="ml-2 bg-green-50 px-2 py-0.5 rounded-full">
                            <Text className="text-green-600 text-[10px] font-quicksand-semibold">
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        )}
                      </View>
                    </View>
                    <Text className="font-quicksand-regular text-gray-600">
                      {address.street}, {address.city}
                    </Text>
                    <Text className="font-quicksand-regular text-gray-500 text-sm">
                      {address.state} {address.zipCode}, {address.country}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={useNewAddress}
                activeOpacity={0.8}
                className={`rounded-2xl p-4 mb-2 border ${
                  selectedAddressId === null
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text className="font-quicksand-semibold text-gray-700">
                  Use a new address
                </Text>
                <Text className="font-quicksand-regular text-gray-500 text-xs mt-1">
                  Enter a different delivery address below.
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/addresses')}
              className="bg-gray-50 rounded-2xl p-4 mb-3 border border-dashed border-gray-300"
            >
              <Text className="font-quicksand-semibold text-gray-700">
                No saved addresses yet
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="font-quicksand-regular text-gray-500 text-sm">
                  Add one to auto-fill checkout next time
                </Text>
                <Image
                  source={images.arrowRight}
                  resizeMode="contain"
                  style={{ width: 20, height: 20, marginLeft: 4, tintColor: '#6B7280' }}
                />
              </View>
            </TouchableOpacity>
          )}

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
            onChangeText={changeField(setStreet)}
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="City"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={changeField(setCity)}
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="State"
            placeholderTextColor="#9CA3AF"
            value={state}
            onChangeText={changeField(setState)}
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="Zip code"
            placeholderTextColor="#9CA3AF"
            value={zipCode}
            onChangeText={changeField(setZipCode)}
            keyboardType="number-pad"
          />
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
            placeholder="Country"
            placeholderTextColor="#9CA3AF"
            value={country}
            onChangeText={changeField(setCountry)}
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
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-gray-800">
                  {method.label}
                </Text>
                {method.id === 'wallet' && (
                  <Text
                    className={`text-xs font-quicksand-regular ${
                      balance >= totalPrice ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    Balance ₹{balance.toFixed(2)}
                    {balance < totalPrice ? ' · Insufficient' : ''}
                  </Text>
                )}
              </View>
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

          {paymentMethod === 'wallet' && balance < totalPrice && (
            <TouchableOpacity
              onPress={() => router.push('/wallet')}
              className="self-start mt-1"
            >
              <View className="flex-row items-center">
                <Text className="text-sm font-quicksand-semibold text-red-500">
                  Add money to wallet
                </Text>
                <Image
                  source={images.arrowRight}
                  resizeMode="contain"
                  style={{ width: 20, height: 20, marginLeft: 4, tintColor: '#EF4444' }}
                />
              </View>
            </TouchableOpacity>
          )}
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
