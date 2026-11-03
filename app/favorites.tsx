import { images } from '@/constants';
import { FoodGridSkeleton } from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { userService } from '@/services/api';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FoodItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

export default function Favorites() {
  const { token } = useAuth();
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;

    try {
      const response = await userService.getFavorites(token);
      if (response.status === 'success') {
        setFavorites(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch favorites:', error);
      Alert.alert('Error', error.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (foodId: string) => {
    if (!token) return;

    try {
      await userService.toggleFavorite(foodId, token);
      setFavorites((current) => current.filter((food) => food._id !== foodId));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove favorite');
    }
  };

  const handleAdd = async (foodId: string) => {
    try {
      await addItem(foodId, 1);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    }
  };

  const renderFood = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      className="w-[48%] bg-white rounded-2xl p-3 mb-4 border border-gray-100"
      onPress={() =>
        router.push({ pathname: '/food/[id]', params: { id: item._id } })
      }
      activeOpacity={0.8}
    >
      <View className="bg-gray-50 rounded-xl p-3 mb-2">
        <Image
          source={item.image ? { uri: item.image } : images.person}
          className="w-full h-24"
          resizeMode="contain"
        />
      </View>
      <Text className="font-quicksand-bold text-gray-800" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="font-quicksand-regular text-gray-500 text-xs mt-1" numberOfLines={1}>
        {item.category}
      </Text>
      <Text className="font-quicksand-bold text-red-500 mt-2">
        ₹{item.price?.toFixed(2)}
      </Text>
      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            handleRemove(item._id);
          }}
          className="px-2 py-1 rounded-full bg-gray-100"
        >
          <Text className="text-gray-500 text-xs font-quicksand-semibold">Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            handleAdd(item._id);
          }}
          className="px-3 py-1 rounded-full bg-red-500"
        >
          <Text className="text-white text-xs font-quicksand-semibold">Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Image source={images.arrowBack} className="size-5" resizeMode="contain" tintColor="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-quicksand-bold text-gray-800">Favorites</Text>
      </View>

      {loading ? (
        <View className="px-4 pt-4">
          <FoodGridSkeleton count={6} />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Image source={images.star} className="w-20 h-20 mb-4" resizeMode="contain" tintColor="#FBBF24" />
          <Text className="text-xl font-quicksand-bold text-gray-800">No favorites yet</Text>
          <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-2">
            Save dishes you love for quick access.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFood}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
