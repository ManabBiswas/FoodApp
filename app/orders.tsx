import { images } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/api';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderItem {
  food?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  'out-for-delivery': '#0EA5E9',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const response = await orderService.getMyOrders(token);
      if (response.status === 'success') {
        setOrders(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      Alert.alert('Error', error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const renderOrder = ({ item }: { item: Order }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-quicksand-bold text-gray-800">
          Order #{item._id.slice(-6).toUpperCase()}
        </Text>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${STATUS_COLORS[item.orderStatus] || '#6B7280'}20` }}
        >
          <Text
            className="text-xs font-quicksand-semibold capitalize"
            style={{ color: STATUS_COLORS[item.orderStatus] || '#6B7280' }}
          >
            {item.orderStatus.replace(/-/g, ' ')}
          </Text>
        </View>
      </View>

      <Text className="font-quicksand-regular text-gray-500 text-xs mb-2">
        {new Date(item.createdAt).toLocaleString()}
      </Text>

      {item.orderItems.map((orderItem, index) => (
        <Text
          key={index}
          className="font-quicksand-medium text-gray-700"
          numberOfLines={1}
        >
          {orderItem.name} × {orderItem.quantity}
        </Text>
      ))}

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="font-quicksand-regular text-gray-500 text-sm">
          {item.orderItems.length} item{item.orderItems.length === 1 ? '' : 's'}
        </Text>
        <Text className="font-quicksand-bold text-red-500">
          ₹{item.totalPrice?.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Image source={images.arrowBack} className="size-5" resizeMode="contain" tintColor="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-quicksand-bold text-gray-800">My Orders</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="mt-4 font-quicksand-regular text-gray-500">Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Image source={images.bag} className="w-20 h-20 mb-4" resizeMode="contain" />
          <Text className="text-xl font-quicksand-bold text-gray-800">No orders yet</Text>
          <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-2">
            Your placed orders will appear here.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/Index')}
            className="mt-6 bg-red-500 rounded-full px-6 py-3"
          >
            <Text className="text-white font-quicksand-bold">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
