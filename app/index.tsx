import { FlatList, Pressable, Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, offers } from "@/constants"
import { Fragment } from "react";
import CartButton from "@/components/CartButton";

export default function Index() {
  const isEven = (num: number) => num % 2 === 0;
  return (
    <SafeAreaView className="flex-1 bg-white">

      <FlatList
        data={offers}
        ListHeaderComponent={
          <View className="flex-row flex-between px-4 ">
            <View className="flex-start">
              <Text className="h3-bold text-quaternary">Delivary to</Text>
              <TouchableOpacity className="opacity-50 flex-row items-center mt-1 gap-x-1">
                <Text className="h3-regular text-gray-600">Current Location</Text>
                <Image source={images.arrowDown} className="size-3 ml-2" resizeMode="contain" />
              </TouchableOpacity>

            </View>
            <View className="flex-end">
              <CartButton />
              {/* <Text className="h3-regular text-gray-600">cart</Text> */}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <Pressable className={`offer-card ${isEven(item.id) ? "flex-row pr-10" : "flex-row-reverse pl-10"}`} style={{ backgroundColor: item.color }}>
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
        contentContainerClassName="pb-14 py-4 px-2"
      />
    </SafeAreaView>
  );
}

