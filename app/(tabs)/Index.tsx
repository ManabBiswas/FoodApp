import CartButton from "@/components/CartButton";
import { images, offers } from "@/constants";
import { Fragment } from "react";
import { Alert, FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const isEven = (num: number) => num % 2 === 0;

  const handleOfferPress = (offerTitle: string) => {
    try {
      console.log(`Offer selected: ${offerTitle}`)
      // Add your offer navigation/details logic here
      Alert.alert('Offer Selected', `You selected ${offerTitle}`)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open offer details')
    }
  }

  const handleLocationPress = () => {
    try {
      console.log('Opening location selector')
      // Add location selection logic here
      Alert.alert('Coming Soon', 'Location selection will be available soon!')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open location selector')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">

      <FlatList
        data={offers}
        ListHeaderComponent={
          <View className="flex-row flex-between px-4 ">
            <View className="flex-start">
              <Text className="h3-bold text-quaternary">Delivary to</Text>
              <TouchableOpacity 
                className="opacity-50 flex-row items-center mt-1 gap-x-1"
                onPress={handleLocationPress}
              >
                <Text className="h3-regular text-gray-600">Current Location</Text>
                <Image source={images.arrowDown} className="size-3 ml-2" resizeMode="contain" />
              </TouchableOpacity>

            </View>
            <View className="flex-end">
              <CartButton />
              <Text className="h3-regular text-gray-600">cart</Text>
            </View>
          </View>
        }
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
                  <View className="offer-card__info "style={{ opacity: pressed ? 0.6 : 1 }}>
                    <Text className="h1-bold text-white-100">{item.title}</Text>
                    <Image source={images.arrowRight} className="size-10 " resizeMode="contain" />
                  </View>
                </Fragment>
              )}
            </Pressable>
          </View>
        )}
        contentContainerClassName="pb-14 pt-2 px-2"
      />
    </SafeAreaView>
  );
}