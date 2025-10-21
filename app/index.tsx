import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView>
      <View className="flex-1 bg-white px-4">
        <Text className="text-2xl font-bold text-primary font-quicksand-bold">
          Welcome to React Native with Nativewind!
        </Text>
        <Text className="text-lg font-quicksand-light text-tertiary">It will be a food app with expo router</Text>
      </View>
    </SafeAreaView>

  );
}
