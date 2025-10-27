import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
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
