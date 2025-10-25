import { images } from '@/constants';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

export default function _layout() {
  const isAuthenticated = true; // Replace with real authentication logic
  if (!isAuthenticated) return <Redirect href="/(auth)/Signin" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6347',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Quicksand-Medium',
        },
      }}
    >
      <Tabs.Screen
        name="Index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Image source={images.home} className="size-6" style={{ tintColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="Search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Image source={images.search} className="size-6" style={{ tintColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <Image source={images.cart} className="size-6" style={{ tintColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            // <Text style={{ fontSize: 24, color }}>👤</Text>
            <Image source={images.person} className="size-6" style={{ tintColor: color }} />
          ),
        }}
      />
    </Tabs>
  )
}
