import { images } from '@/constants'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const Signin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSignIn = () => {
    // Add your sign-in logic here
    console.log('Sign in with:', email, password)
    // For now, navigate to home
    router.replace('/(tabs)/Index')
  }

  return (
    <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled">

      <View className="flex-1 px-6 pt-24 pb-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Quicksand-Bold' }}>
            Welcome Back!
          </Text>
          <Text className="text-base text-gray-600" style={{ fontFamily: 'Quicksand-Regular' }}>
            Sign in to continue
          </Text>
        </View>

        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
              Email
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-3xl px-4 py-3">
              <Image source={images.envelope} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
              <TextInput
                className="flex-1 text-base text-gray-900"
                style={{ fontFamily: 'Quicksand-Regular' }}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
              Password
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-3xl px-4 py-3">
              <Image source={images.user} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
              <TextInput
                className="flex-1 text-base text-gray-900"
                style={{ fontFamily: 'Quicksand-Regular' }}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand-Medium' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end">
            <Text className="text-sm text-red-500" style={{ fontFamily: 'Quicksand-Medium' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            className="bg-red-500 rounded-3xl py-4 mt-4"
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold" style={{ fontFamily: 'Quicksand-Bold' }}>
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-gray-600 text-base" style={{ fontFamily: 'Quicksand-Regular' }}>
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/Signup')}>
              <Text className="text-red-500 text-base font-semibold" style={{ fontFamily: 'Quicksand-Bold' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default Signin