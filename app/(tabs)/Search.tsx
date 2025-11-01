import { images } from '@/constants'
import { foodService } from '@/services/api'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [foods, setFoods] = useState<any[]>([])
  const [filteredFoods, setFilteredFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'burger', name: 'Burger', icon: '🍔' },
    { id: 'dessert', name: 'Dessert', icon: '🍰' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'salad', name: 'Salad', icon: '🥗' },
    { id: 'asian', name: 'Asian', icon: '🍜' },
    { id: 'indian', name: 'Indian', icon: '🍛' },
  ]

  useEffect(() => {
    fetchFoods()
  }, [])

  const filterFoods = useCallback(() => {
    let filtered = foods

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        food => food.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(food =>
        food.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredFoods(filtered)
  }, [foods, selectedCategory, searchQuery])

  useEffect(() => {
    filterFoods()
  }, [filterFoods])

  const fetchFoods = async () => {
    try {
      setLoading(true)
      const response = await foodService.getAll()
      
      if (response.status === 'success') {
        setFoods(response.data || [])
      }
    } catch (error: any) {
      console.error('Failed to fetch foods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search', 'Please enter something to search')
      return
    }

    try {
      setIsSearching(true)
      const response = await foodService.search(searchQuery)
      
      if (response.status === 'success') {
        setFilteredFoods(response.data || [])
      }
    } catch (error: any) {
      console.error('Search error:', error)
      Alert.alert('Search Error', error.message || 'Failed to search')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  const handleFoodPress = (food: any) => {
    Alert.alert(
      food.name,
      `${food.description || 'No description'}\n\nPrice: $${food.price?.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', onPress: () => handleAddToCart(food) }
      ]
    )
  }

  const handleAddToCart = (food: any) => {
    Alert.alert('Success', `${food.name} added to cart!`)
  }

  const renderFoodItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="w-[48%] bg-white rounded-2xl p-3 mb-4 shadow-sm"
      onPress={() => handleFoodPress(item)}
      activeOpacity={0.7}
    >
      <View className="bg-gray-50 rounded-xl p-3 mb-2">
        <Image
          source={item.image ? { uri: item.image } : images.person}
          className="w-full h-28"
          resizeMode="contain"
        />
        {item.isVeg !== undefined && (
          <View className={`absolute top-2 right-2 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'} rounded-full px-2 py-1`}>
            <Text className="text-white text-xs font-quicksand-bold">
              {item.isVeg ? '🌱 Veg' : '🍖 Non-Veg'}
            </Text>
          </View>
        )}
      </View>

      <Text className="font-quicksand-bold text-gray-800 text-base" numberOfLines={1}>
        {item.name}
      </Text>

      <Text className="font-quicksand-regular text-gray-500 text-xs mt-1" numberOfLines={2}>
        {item.description || 'Delicious food item'}
      </Text>

      <View className="flex-row items-center mt-2">
        {item.rating && (
          <View className="flex-row items-center mr-2">
            <Text className="text-yellow-500 mr-1">⭐</Text>
            <Text className="font-quicksand-semibold text-gray-700 text-xs">
              {item.rating}
            </Text>
          </View>
        )}
        <Text className="font-quicksand-regular text-gray-400 text-xs">
          {item.category}
        </Text>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <Text className="font-quicksand-bold text-red-500 text-lg">
          ${item.price?.toFixed(2)}
        </Text>
        <TouchableOpacity
          className="bg-red-500 rounded-full px-4 py-2"
          onPress={() => handleAddToCart(item)}
        >
          <Text className="text-white font-quicksand-semibold text-xs">
            Add +
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-2 pb-3">
        <Text className="text-3xl font-quicksand-bold text-gray-800">
          Search Food 🔍
        </Text>
        <Text className="text-sm font-quicksand-regular text-gray-500 mt-1">
          Find your favorite meals
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3">
          <Image source={images.search} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
          <TextInput
            className="flex-1 font-quicksand-medium text-gray-800 text-base"
            placeholder="Search for pizza, burger, drinks..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-400 text-xl mr-2">✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="bg-red-500 rounded-xl px-4 py-2"
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-quicksand-bold">Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`mr-3 px-4 py-3 rounded-2xl ${
                selectedCategory === category.name
                  ? 'bg-red-500'
                  : 'bg-gray-50'
              }`}
              onPress={() => handleCategorySelect(category.name)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">{category.icon}</Text>
                <Text
                  className={`font-quicksand-semibold ${
                    selectedCategory === category.name
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View className="px-4 mb-3">
        <Text className="font-quicksand-semibold text-gray-600">
          {loading ? 'Loading...' : `${filteredFoods.length} items found`}
        </Text>
      </View>

      {/* Food Grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="mt-4 font-quicksand-regular text-gray-500">
            Loading foods...
          </Text>
        </View>
      ) : filteredFoods.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-xl font-quicksand-bold text-gray-800 text-center">
            No results found
          </Text>
          <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-2">
            {searchQuery
              ? `We couldn't find "${searchQuery}"`
              : 'No food items available in this category'}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-red-500 rounded-full px-6 py-3"
            onPress={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
          >
            <Text className="text-white font-quicksand-bold">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredFoods}
          renderItem={renderFoodItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  )
}