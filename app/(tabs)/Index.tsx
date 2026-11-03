import CartButton from "@/components/CartButton";
import { FoodGridSkeleton, Skeleton } from "@/components/Skeleton";
import { images, offers } from "@/constants";
import { useAddress } from "@/contexts/AddressContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { foodService } from "@/services/api";
import { formatAddressLabel } from "@/utils/address";
import { showAlert } from "@/utils/alert";
import { resolveCurrentAddress } from "@/utils/currentLocation";
import { router } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const {
    addresses,
    defaultAddress,
    isLoading: addressesLoading,
    addAddress,
    setDefaultAddress,
  } = useAddress();
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectingAddressId, setSelectingAddressId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const fetchFoods = async () => {
    try {
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

  useEffect(() => {
    fetchFoods();
  }, []);

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
    router.push({ pathname: '/food/[id]', params: { id: food._id } });
  }

  const handleAddToCart = async (food: any) => {
    try {
      await addItem(food._id, 1);
      showAlert('Added to Cart', `${food.name} has been added to your cart.`);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to add item to cart');
    }
  }

  const locationLabel = defaultAddress
    ? `${formatAddressLabel(defaultAddress.label)} · ${defaultAddress.city}`
    : 'Set delivery address'

  const handleSelectAddress = async (addressId: string) => {
    if (addressId === defaultAddress?._id) {
      setLocationOpen(false)
      return
    }

    try {
      setSelectingAddressId(addressId)
      await setDefaultAddress(addressId)
      setLocationOpen(false)
    } catch (error: any) {
      showAlert('Address Error', error.message || 'Failed to set delivery address')
    } finally {
      setSelectingAddressId(null)
    }
  }

  const handleUseCurrentLocation = async () => {
    if (locating) return

    try {
      setLocating(true)
      const current = await resolveCurrentAddress()

      const normalize = (value: string) => value.trim().toLowerCase()
      const nearby = addresses.find((address) => {
        const latitude = address.coordinates?.latitude
        const longitude = address.coordinates?.longitude
        const closeByCoordinates =
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          Math.abs(latitude - current.latitude) < 0.001 &&
          Math.abs(longitude - current.longitude) < 0.001
        const sameAddress =
          normalize(address.street) === normalize(current.street) &&
          normalize(address.city) === normalize(current.city)

        return closeByCoordinates || sameAddress
      })

      if (nearby) {
        await setDefaultAddress(nearby._id)
      } else {
        await addAddress({
          label: 'current',
          street: current.street,
          city: current.city,
          state: current.state,
          zipCode: current.zipCode,
          country: current.country,
          coordinates: {
            latitude: current.latitude,
            longitude: current.longitude,
          },
          isDefault: true,
        })
      }

      setLocationOpen(false)
    } catch (error: any) {
      showAlert(
        'Location Error',
        error.message || 'Failed to use your current location'
      )
    } finally {
      setLocating(false)
    }
  }

  const openAddressManager = () => {
    setLocationOpen(false)
    router.push('/addresses')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-start px-4 py-2">
        <View className="flex-1">
          <Text className="h3-bold text-quaternary">
            {user ? `Hey ${user.name}! 👋` : 'Welcome!'}
          </Text>
          <TouchableOpacity
            className="flex-row items-center mt-1"
            onPress={() => setLocationOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Delivery address: ${locationLabel}. Change address`}
          >
            <Image
              source={images.location}
              style={{ width: 14, height: 14, marginRight: 4, tintColor: '#FE8C00' }}
              resizeMode="contain"
            />
            {addressesLoading && !defaultAddress ? (
              <Skeleton className="h-4 w-32 rounded-full" />
            ) : (
              <Text
                className="h3-regular font-quicksand-semibold text-gray-700"
                numberOfLines={1}
                style={{ flexShrink: 1 }}
              >
                {locationLabel}
              </Text>
            )}
            <Image
              source={images.arrowDown}
              style={{ width: 10, height: 10, marginLeft: 6, tintColor: '#6B7280' }}
              resizeMode="contain"
            />
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
            <FoodGridSkeleton count={6} />
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
                      ₹{food.price?.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddToCart(food);
                      }}
                      className="bg-red-500 rounded-full px-3 py-1"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-quicksand-semibold text-xs">
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="h-10" />
      </ScrollView>

      <Modal
        visible={locationOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={() => setLocationOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close address picker"
          />

          <View className="bg-white rounded-t-[32px] px-5 pt-3 pb-8">
            <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-4" />

            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-quicksand-bold text-gray-800">
                  Delivery address
                </Text>
                <Text className="text-xs font-quicksand-regular text-gray-500 mt-0.5">
                  Choose where your order should arrive
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setLocationOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close address picker"
                className="py-1"
              >
                <Text className="text-sm font-quicksand-semibold text-gray-500">
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleUseCurrentLocation}
              disabled={locating || selectingAddressId !== null}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Use current location"
              className="flex-row items-center rounded-2xl px-3 py-3 mb-3 border border-[#FE8C0033] bg-orange-50"
            >
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-primary">
                {locating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Image
                    source={images.location}
                    style={{ width: 16, height: 16, tintColor: '#FFFFFF' }}
                    resizeMode="contain"
                  />
                )}
              </View>

              <View className="flex-1 ml-3">
                <Text className="font-quicksand-bold text-gray-800">
                  {locating ? 'Finding your address…' : 'Use current location'}
                </Text>
                <Text className="text-xs font-quicksand-regular text-gray-500 mt-0.5">
                  {locating
                    ? 'This may take a moment'
                    : 'Detect where you are right now'}
                </Text>
              </View>

              {!locating && (
                <Image
                  source={images.arrowRight}
                  style={{ width: 28, height: 28, tintColor: '#FE8C00' }}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            {addresses.length === 0 ? (
              <View className="items-center py-6">
                <Image
                  source={images.location}
                  style={{ width: 40, height: 40, tintColor: '#D1D5DB' }}
                  resizeMode="contain"
                />
                <Text className="font-quicksand-semibold text-gray-700 mt-3">
                  No saved addresses
                </Text>
                <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-1 px-6">
                  Add an address so we know where to deliver your food.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 340 }}
              >
                {addresses.map((address) => {
                  const isSelected = address._id === defaultAddress?._id;
                  const isBusy = selectingAddressId === address._id;

                  return (
                    <TouchableOpacity
                      key={address._id}
                      onPress={() => handleSelectAddress(address._id)}
                      disabled={selectingAddressId !== null}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Deliver to ${formatAddressLabel(address.label)}, ${address.street}, ${address.city}`}
                      className={`flex-row items-center rounded-2xl px-3 py-3 mb-2 border ${
                        isSelected
                          ? 'bg-orange-50 border-primary'
                          : 'bg-gray-50 border-transparent'
                      }`}
                    >
                      <View
                        className={`w-9 h-9 rounded-xl items-center justify-center ${
                          isSelected ? 'bg-primary' : 'bg-white'
                        }`}
                      >
                        <Image
                          source={images.location}
                          style={{
                            width: 16,
                            height: 16,
                            tintColor: isSelected ? '#FFFFFF' : '#9CA3AF',
                          }}
                          resizeMode="contain"
                        />
                      </View>

                      <View className="flex-1 ml-3">
                        <Text className="font-quicksand-bold text-gray-800">
                          {formatAddressLabel(address.label)}
                        </Text>
                        <Text
                          className="text-xs font-quicksand-regular text-gray-500 mt-0.5"
                          numberOfLines={1}
                        >
                          {address.street}, {address.city}
                        </Text>
                      </View>

                      {isBusy ? (
                        <ActivityIndicator size="small" color="#FE8C00" />
                      ) : isSelected ? (
                        <Image
                          source={images.check}
                          style={{ width: 18, height: 18, tintColor: '#FE8C00' }}
                          resizeMode="contain"
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={openAddressManager}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={
                addresses.length === 0 ? 'Add an address' : 'Manage addresses'
              }
              className="mt-3 rounded-2xl bg-primary py-3.5 flex-row items-center justify-center"
            >
              <Image
                source={images.plus}
                style={{ width: 14, height: 14, marginRight: 6, tintColor: '#FFFFFF' }}
                resizeMode="contain"
              />
              <Text className="text-white font-quicksand-bold">
                {addresses.length === 0 ? 'Add an address' : 'Manage addresses'}
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-[11px] font-quicksand-regular text-gray-400 mt-3">
              Your delivery address is also used at checkout.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}