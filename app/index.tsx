import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Index" />;
  }

  return <Redirect href="/(auth)/Signin" />;
}
