import { FlatList, Pressable, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, offers } from "@/constants"
import { Fragment } from "react";

export default function Index() {
  const isEven = (num: number) => num % 2 === 0;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList 
        data={offers}
        renderItem={({ item }) => (
          <View>
            <Pressable className={`offer-card ${isEven(item.id) ? "flex-row pr-10" : "flex-row-reverse pl-10"}`} style={{ backgroundColor: item.color }}>
              {({ pressed }) => (
                <Fragment>
                  <View className="w-1/2 p-4 h-full justify-between" style={{ opacity: pressed ? 0.6 : 1 }}>
                    <Image className={'size-full'} resizeMode={"contain"} source={item.image} />
                  </View>
                  <View className="offer-card__info ">
                    <Text className="h1-bold text-white-100">{item.title}</Text>
                    <Image source={images.arrowRight} className="size-10 " resizeMode="contain" />
                  </View>
                </Fragment>
              )}
            </Pressable>
          </View>
        )}
        contentContainerClassName="py-14 px-2"
      />
    </SafeAreaView>
  );
}

