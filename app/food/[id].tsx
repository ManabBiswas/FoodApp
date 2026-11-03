import { Skeleton } from '@/components/Skeleton';
import { images } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { foodService, userService } from '@/services/api';
import { showAlert } from '@/utils/alert';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Topping {
  name: string;
  price: number;
  image?: string;
}

interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  isAvailable?: boolean;
  preparationTime?: number;
  rating?: number;
  numReviews?: number;
  nutritionInfo?: NutritionInfo;
  toppings?: Topping[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  spicyLevel?: number;
}

const goBack = () => {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/(tabs)/Index');
};

function DetailsSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative">
        <Skeleton className="w-full h-[300px] rounded-none" />
        <TouchableOpacity
          onPress={goBack}
          className="absolute top-3 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Image
            source={images.arrowBack}
            style={{ width: 18, height: 18, tintColor: '#181C2E' }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-6">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-3/4 rounded-xl mt-3" />
        <Skeleton className="h-4 w-1/2 rounded-full mt-3" />
        <Skeleton className="h-20 w-full rounded-2xl mt-5" />
        <Skeleton className="h-4 w-28 rounded-full mt-6" />
        <View className="flex-row gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="flex-1 h-16 rounded-2xl" />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function FoodDetails() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();
  const { addItem } = useCart();

  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [related, setRelated] = useState<FoodItem[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const loadFood = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('This dish could not be found.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await foodService.getById(id);

      if (response.status === 'success' && response.data) {
        setFood(response.data);
      } else {
        setError('This dish could not be found.');
      }
    } catch (requestError: any) {
      setError(requestError.message || 'Failed to load this dish.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFood();
  }, [loadFood]);

  useEffect(() => {
    setQuantity(1);
    setSelectedToppings([]);
  }, [id]);

  useEffect(() => {
    if (!id || !token) {
      setIsFavorite(false);
      return;
    }

    let active = true;

    userService
      .getFavorites(token)
      .then((response) => {
        if (!active) return;
        const favorites: FoodItem[] = response.data || [];
        setIsFavorite(favorites.some((item) => item._id === id));
      })
      .catch(() => {
        // Favorites are a secondary action; failing to load them should not
        // block the details screen.
      });

    return () => {
      active = false;
    };
  }, [id, token]);

  const category = food?.category;

  useEffect(() => {
    if (!category || !id) return;

    let active = true;
    setRelatedLoading(true);

    foodService
      .getByCategory(category)
      .then((response) => {
        if (!active) return;
        const items: FoodItem[] = response.data || [];
        setRelated(
          items
            .filter((item) => item._id !== id && item.isAvailable !== false)
            .slice(0, 6)
        );
      })
      .catch(() => {
        if (active) setRelated([]);
      })
      .finally(() => {
        if (active) setRelatedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, id]);

  const toppingsTotal = useMemo(() => {
    if (!food?.toppings) return 0;

    return food.toppings
      .filter((topping) => selectedToppings.includes(topping.name))
      .reduce((sum, topping) => sum + (topping.price || 0), 0);
  }, [food, selectedToppings]);

  const total = ((food?.price || 0) + toppingsTotal) * quantity;
  const isAvailable = food?.isAvailable !== false;

  const toggleTopping = (name: string) => {
    setSelectedToppings((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  const handleAddToCart = async () => {
    if (!food || adding) return;

    try {
      setAdding(true);
      await addItem(
        food._id,
        quantity,
        selectedToppings.map((name) => ({ name }))
      );
      showAlert(
        'Added to Cart',
        `${quantity} × ${food.name} added to your cart.`
      );
    } catch (requestError: any) {
      showAlert(
        'Error',
        requestError.message || 'Failed to add item to cart'
      );
    } finally {
      setAdding(false);
    }
  };

  const handleFavorite = async () => {
    if (!food) return;

    if (!token) {
      showAlert('Sign in required', 'Sign in to save dishes to your favorites.');
      return;
    }

    try {
      setFavoriteBusy(true);
      await userService.toggleFavorite(food._id, token);
      setIsFavorite((current) => !current);
    } catch (requestError: any) {
      showAlert(
        'Error',
        requestError.message || 'Failed to update favorites'
      );
    } finally {
      setFavoriteBusy(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !food) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={goBack}
            className="p-2 mr-2"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Image
              source={images.arrowBack}
              style={{ width: 20, height: 20, tintColor: '#181C2E' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={images.emptyState}
            style={{ width: 220, height: 165 }}
            resizeMode="contain"
          />
          <Text className="text-xl font-quicksand-bold text-gray-800 text-center mt-2">
            Dish unavailable
          </Text>
          <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-2">
            {error || 'This dish could not be found.'}
          </Text>
          <TouchableOpacity
            onPress={loadFood}
            className="mt-6 bg-red-500 rounded-full px-8 py-3"
          >
            <Text className="text-white font-quicksand-bold">Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nutrition = food.nutritionInfo;
  const nutritionItems = nutrition
    ? [
        { label: 'Calories', value: nutrition.calories, unit: 'kcal' },
        { label: 'Protein', value: nutrition.protein, unit: 'g' },
        { label: 'Carbs', value: nutrition.carbs, unit: 'g' },
        { label: 'Fat', value: nutrition.fat, unit: 'g' },
      ].filter((item) => typeof item.value === 'number' && item.value > 0)
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View className="relative">
          <Image
            source={food.image ? { uri: food.image } : images.person}
            style={{ width: '100%', height: 300 }}
            resizeMode="cover"
          />

          {!isAvailable && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center">
              <View className="bg-white rounded-full px-5 py-2">
                <Text className="font-quicksand-bold text-gray-800">
                  Currently unavailable
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="-mt-6 rounded-t-[32px] bg-white px-5 pt-6">
          <View className="flex-row items-center flex-wrap gap-2">
            <View className="bg-orange-50 px-3 py-1 rounded-full">
              <Text className="text-primary font-quicksand-semibold text-xs">
                {food.category}
              </Text>
            </View>

            <View
              className={`px-3 py-1 rounded-full ${
                food.isVegetarian ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <Text
                className={`font-quicksand-semibold text-xs ${
                  food.isVegetarian ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {food.isVegan
                  ? '🌱 Vegan'
                  : food.isVegetarian
                    ? '🌱 Vegetarian'
                    : '🍖 Non-veg'}
              </Text>
            </View>

            {food.spicyLevel ? (
              <View className="bg-red-50 px-3 py-1 rounded-full">
                <Text className="text-xs">
                  {'🌶️'.repeat(Math.min(food.spicyLevel, 3))}
                </Text>
              </View>
            ) : null}
          </View>

          <Text className="text-[28px] leading-9 font-quicksand-bold text-dark-100 mt-3">
            {food.name}
          </Text>

          <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1 mt-2">
            {typeof food.rating === 'number' && food.rating > 0 && (
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className="font-quicksand-semibold text-gray-700">
                  {food.rating.toFixed(1)}
                </Text>
                {typeof food.numReviews === 'number' && food.numReviews > 0 && (
                  <Text className="font-quicksand-regular text-gray-400 ml-1">
                    ({food.numReviews} reviews)
                  </Text>
                )}
              </View>
            )}

            <View className="flex-row items-center">
              <Image
                source={images.clock}
                style={{ width: 14, height: 14, tintColor: '#9CA3AF' }}
                resizeMode="contain"
              />
              <Text className="font-quicksand-regular text-gray-500 ml-1">
                {food.preparationTime || 20} min
              </Text>
            </View>
          </View>

          <Text className="font-quicksand-regular text-gray-600 leading-6 mt-4">
            {food.description}
          </Text>

          {nutritionItems.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-quicksand-bold text-dark-100">
                Nutrition
              </Text>
              <View className="flex-row gap-2 mt-3">
                {nutritionItems.map((item) => (
                  <View
                    key={item.label}
                    className="flex-1 bg-[#F7F3EC] rounded-2xl py-3 items-center"
                  >
                    <Text className="font-quicksand-bold text-dark-100">
                      {item.value}
                      {item.unit === 'g' ? 'g' : ''}
                    </Text>
                    <Text className="font-quicksand-regular text-gray-500 text-[11px] mt-0.5">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {food.toppings && food.toppings.length > 0 && (
            <View className="mt-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-quicksand-bold text-dark-100">
                  Make it yours
                </Text>
                <Text className="font-quicksand-regular text-gray-400 text-xs">
                  Optional
                </Text>
              </View>

              <View className="mt-3">
                {food.toppings.map((topping) => {
                  const selected = selectedToppings.includes(topping.name);

                  return (
                    <TouchableOpacity
                      key={topping.name}
                      onPress={() => toggleTopping(topping.name)}
                      activeOpacity={0.8}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      className={`flex-row items-center justify-between rounded-2xl px-4 py-3 mb-2 border ${
                        selected
                          ? 'border-primary bg-orange-50'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-md items-center justify-center mr-3 ${
                            selected ? 'bg-primary' : 'bg-white border border-gray-300'
                          }`}
                        >
                          {selected && (
                            <Text className="text-white text-[10px] font-bold">
                              ✓
                            </Text>
                          )}
                        </View>
                        <Text className="font-quicksand-semibold text-gray-700">
                          {topping.name}
                        </Text>
                      </View>

                      <Text className="font-quicksand-bold text-gray-600">
                        +₹{(topping.price || 0).toFixed(0)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View className="mt-6 mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-quicksand-bold text-dark-100">
                You may also like
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/Search')}
                accessibilityRole="button"
                accessibilityLabel="Browse all dishes"
              >
                <Image
                  source={images.arrowRight}
                  style={{ width: 28, height: 28, tintColor: '#FE8C00' }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {relatedLoading ? (
              <View className="flex-row gap-3 mt-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-36 h-32 rounded-2xl" />
                ))}
              </View>
            ) : related.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
                contentContainerStyle={{ gap: 12 }}
              >
                {related.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() =>
                      router.push({
                        pathname: '/food/[id]',
                        params: { id: item._id },
                      })
                    }
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${item.name} details`}
                    className="w-36 bg-gray-50 rounded-2xl p-2"
                  >
                    <Image
                      source={item.image ? { uri: item.image } : images.person}
                      className="w-full h-20 rounded-xl"
                      resizeMode="cover"
                    />
                    <Text
                      className="font-quicksand-bold text-gray-800 text-sm mt-2"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="font-quicksand-bold text-red-500 text-sm mt-1">
                      ₹{item.price?.toFixed(0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text className="font-quicksand-regular text-gray-400 text-sm mt-3">
                No similar dishes right now.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Header actions */}
      <View className="absolute top-3 left-4 right-4 flex-row justify-between">
        <TouchableOpacity
          onPress={goBack}
          className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          style={{ elevation: 3 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Image
            source={images.arrowBack}
            style={{ width: 18, height: 18, tintColor: '#181C2E' }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFavorite}
          disabled={favoriteBusy}
          className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          style={{ elevation: 3 }}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Save to favorites'
          }
        >
          {favoriteBusy ? (
            <ActivityIndicator size="small" color="#F59E0B" />
          ) : (
            <Image
              source={images.star}
              style={{
                width: 20,
                height: 20,
                tintColor: isFavorite ? '#F59E0B' : '#9CA3AF',
              }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Sticky order bar */}
      <View className="border-t border-gray-100 px-5 pt-3 pb-3 bg-white">
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center bg-gray-100 rounded-full px-1 py-1">
            <TouchableOpacity
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1 || adding}
              className={`w-8 h-8 rounded-full items-center justify-center bg-white ${
                quantity <= 1 ? 'opacity-40' : ''
              }`}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
            >
              <Text className="text-gray-700 font-bold">−</Text>
            </TouchableOpacity>

            <Text className="w-8 text-center font-quicksand-bold text-gray-800">
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setQuantity((current) => Math.min(50, current + 1))
              }
              disabled={quantity >= 50 || adding}
              className={`w-8 h-8 rounded-full items-center justify-center bg-white ${
                quantity >= 50 ? 'opacity-40' : ''
              }`}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
            >
              <Text className="text-gray-700 font-bold">+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!isAvailable || adding}
            activeOpacity={0.85}
            className={`flex-1 rounded-2xl py-3 items-center ${
              isAvailable ? 'bg-red-500' : 'bg-gray-300'
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Add ${food.name} to cart`}
          >
            {adding ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-quicksand-bold text-base">
                {isAvailable
                  ? `Add to cart · ₹${total.toFixed(0)}`
                  : 'Unavailable'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
