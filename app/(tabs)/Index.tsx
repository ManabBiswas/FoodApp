import CartButton from "@/components/CartButton";
import { images, offers } from "@/constants";
import { foodService } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fragment, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    fetchFoods();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await foodService.getAll();
      
      if (response.status === 'success') {
        setFoods(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch foods:', error);
      // Don't show alert for initial load failure
    } finally {
      setLoading(false);
    }
  };

  const isEven = (num: number) => num % 2 === 0;

  const handleOfferPress = (offerTitle: string) => {
    try {
      console.log(`Offer selected: ${offerTitle}`)
      Alert.alert('Offer Selected', `You selected ${offerTitle}`)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open offer details')
    }
  }

  const handleFoodPress = (food: any) => {
    try {
      console.log('Food selected:', food.name)
      Alert.alert(food.name, `Price: $${food.price}\n${food.description || 'No description available'}`)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open food details')
    }
  }

  const handleLocationPress = () => {
    try {
      console.log('Opening location selector')
      Alert.alert('Coming Soon', 'Location selection will be available soon!')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open location selector')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-start px-4 py-2">
        <View className="flex-1">
          <Text className="h3-bold text-quaternary">
            {userData ? `Hey ${userData.name}! 👋` : 'Welcome!'}
          </Text>
          <TouchableOpacity 
            className="flex-row items-center mt-1 gap-x-1"
            onPress={handleLocationPress}
          >
            <Text className="h3-regular text-gray-600">Current Location</Text>
            <Image source={images.arrowDown} className="size-3 ml-2" resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View className="items-center">
          <CartButton />
          <Text className="h3-regular text-gray-600">cart</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Offers Section */}
        <View className="px-2 pt-2">
          <FlatList
            data={offers}
            horizontal={false}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View>
                <Pressable 
                  className={`offer-card ${isEven(item.id) ? "flex-row pr-10" : "flex-row-reverse pl-10"}`} 
                  style={{ backgroundColor: item.color }}
                  onPress={() => handleOfferPress(item.title)}
                >
                  {({ pressed }) => (
                    <Fragment>
                      <View className="w-1/2 p-4 h-full justify-between" style={{ opacity: pressed ? 0.6 : 1 }}>
                        <Image className={'size-full'} resizeMode={"contain"} source={item.image} />
                      </View>
                      <View className="offer-card__info" style={{ opacity: pressed ? 0.6 : 1 }}>
                        <Text className="h1-bold text-white-100">{item.title}</Text>
                        <Image source={images.arrowRight} className="size-10" resizeMode="contain" />
                      </View>
                    </Fragment>
                  )}
                </Pressable>
              </View>
            )}
          />
        </View>

        {/* Food Items Section */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-quicksand-bold text-gray-800">
              Menu Items
            </Text>
            <TouchableOpacity onPress={fetchFoods}>
              <Text className="text-red-500 font-quicksand-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10">
              <ActivityIndicator size="large" color="#EF4444" />
              <Text className="text-center mt-4 text-gray-600 font-quicksand-regular">
                Loading menu items...
              </Text>
            </View>
          ) : foods.length === 0 ? (
            <View className="py-10 px-4">
              <Text className="text-center text-gray-600 font-quicksand-regular text-lg">
                📦 No food items available yet
              </Text>
              <Text className="text-center text-gray-500 font-quicksand-regular mt-2">
                Check back later for delicious menu items!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {foods.map((food: any, index: number) => (
                <TouchableOpacity
                  key={food._id || index}
                  className="w-[48%] bg-gray-50 rounded-2xl p-3 mb-4"
                  onPress={() => handleFoodPress(food)}
                  activeOpacity={0.7}
                >
                  <View className="bg-white rounded-xl p-2 mb-2">
                    <Image
                      source={food.image ? { uri: food.image } : images.person}
                      className="w-full h-24"
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800" numberOfLines={1}>
                    {food.name}
                  </Text>
                  <Text className="font-quicksand-regular text-gray-500 text-xs mt-1" numberOfLines={1}>
                    {food.category}
                  </Text>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="font-quicksand-bold text-red-500">
                      ${food.price?.toFixed(2)}
                    </Text>
                    <View className="bg-red-500 rounded-full px-3 py-1">
                      <Text className="text-white font-quicksand-semibold text-xs">
                        Add
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}