import { images } from '@/constants'
import { router } from 'expo-router'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Profile() {
  const user = {
    name: 'Manab Biswas',
    email: 'manab.biswas@example.com',
    phone: '+1234567890',
    avatar: images.person,
    memberSince: 'Member since 2025'
  }

  const quickActions = [
    { id: 1, icon: images.bag, title: 'Orders', count: '24', color: '#FF6B6B' },
    { id: 2, icon: images.star, title: 'Favorites', count: '12', color: '#FFD93D' },
    { id: 3, icon: images.location, title: 'Address', count: '3', color: '#6BCF7F' },
    { id: 4, icon: images.rupee, title: 'Wallet', count: '₹250', color: '#4ECDC4' },
  ]

  const menuSections = [
    {
      title: 'Account',
      items: [
        { id: 1, icon: images.person, title: 'Edit Profile', color: '#FF6B6B' },
        { id: 2, icon: images.location, title: 'Delivery Addresses', color: '#6BCF7F' },
        { id: 3, icon: images.envelope, title: 'Notifications', color: '#FFD93D' },
      ]
    },
    {
      title: 'More',
      items: [
        { id: 4, icon: images.star, title: 'Rate Us', color: '#FFD93D' },
        { id: 5, icon: images.phone, title: 'Help & Support', color: '#4ECDC4' },
        { id: 6, icon: images.check, title: 'Terms & Conditions', color: '#95A5A6' },
      ]
    }
  ]

  const handleLogout = () => {
    console.log('Logout')
    router.replace('/(auth)/Signin')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header with Background */}
        <View className="bg-primary rounded-b-[40px] pb-8 mb-4">
          {/* Top Header */}
          <View className="px-6 pt-4 pb-6">
            <Text className="text-white text-2xl" style={{ fontFamily: 'Quicksand-Bold' }}>
              My Profile
            </Text>
          </View>

          {/* Profile Card */}
          <View className="mx-6 bg-white rounded-3xl p-5 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="relative">
                <Image
                  source={user.avatar}
                  className="w-24 h-24 rounded-3xl"
                  resizeMode="cover"
                />
                <View className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white items-center justify-center">
                  <View className="w-3 h-3 bg-white rounded-full" />
                </View>
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-xl text-gray-900 mb-1" style={{ fontFamily: 'Quicksand-Bold' }}>
                  {user.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Quicksand-Medium' }}>
                  {user.email}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-red-50 px-3 py-1 rounded-full">
                    <Text className="text-xs text-red-500" style={{ fontFamily: 'Quicksand-SemiBold' }}>
                      🎉 Gold Member
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity 
              className="bg-primary rounded-2xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Image source={images.pencil} className="w-5 h-5 mr-2" tintColor="#FFFFFF" />
              <Text className="text-white text-base" style={{ fontFamily: 'Quicksand-Bold' }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row flex-wrap -mx-2">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="w-1/2 px-2 mb-3"
                activeOpacity={0.7}
              >
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                    style={{ backgroundColor: action.color + '15' }}
                  >
                    <Image
                      source={action.icon}
                      className="w-6 h-6"
                      resizeMode="contain"
                      style={{ tintColor: action.color }}
                    />
                  </View>
                  <Text className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Quicksand-Bold' }}>
                    {action.count}
                  </Text>
                  <Text className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand-Medium' }}>
                    {action.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="px-6 mb-6">
            <Text className="text-lg text-gray-900 mb-3" style={{ fontFamily: 'Quicksand-Bold' }}>
              {section.title}
            </Text>
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center px-4 py-4 ${
                    index !== section.items.length - 1 ? 'border-b-2 border-gray-50' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <View 
                    className="w-11 h-11 rounded-xl items-center justify-center"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <Image
                      source={item.icon}
                      className="w-5 h-5"
                      resizeMode="contain"
                      style={{ tintColor: item.color }}
                    />
                  </View>

                  <Text className="flex-1 ml-4 text-base text-gray-900" style={{ fontFamily: 'Quicksand-SemiBold' }}>
                    {item.title}
                  </Text>

                  <Image
                    source={images.arrowRight}
                    className="w-10 h-10"
                    resizeMode="contain"
                    tintColor="#000F00"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-2xl py-4 flex-row items-center justify-center border-2 border-red-500"
            activeOpacity={0.8}
          >
            <Image
              source={images.logout}
              className="w-6 h-6 mr-2"
              resizeMode="contain"
              tintColor="#EF4444"
            />
            <Text className="text-red-500 text-lg" style={{ fontFamily: 'Quicksand-Bold' }}>
              Logout
            </Text>
          </TouchableOpacity>
          
          <Text className="text-center text-gray-400 text-sm mt-4" style={{ fontFamily: 'Quicksand-Regular' }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}