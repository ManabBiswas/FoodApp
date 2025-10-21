import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { offers } from "@/constants"

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={offers}
        renderItem={({item}) => (<View>
          <Text>{item.title}</Text>
        </View>)}
      />
    </SafeAreaView>
  );
}
