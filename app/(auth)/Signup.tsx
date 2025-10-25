import { images } from '@/constants'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignUp = () => {
    // Add your sign-up logic here
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    console.log('Sign up with:', { name, email, phone, password })
    // For now, navigate to sign in
    router.replace('/(auth)/Signin')
  }

  return (
    <ScrollView className="flex-1 px-6 pt-24" showsVerticalScrollIndicator={false}>
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Quicksand-Bold' }}>
          Create Account
        </Text>
        <Text className="text-base text-gray-600" style={{ fontFamily: 'Quicksand-Regular' }}>
          Sign up to get started
        </Text>
      </View>

      <View className="space-y-4 pb-8">
        {/* Name Input */}
        <View>
          <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
            Full Name
          </Text>
          <View className="flex-row items-center bg-gray-300 rounded-full px-4 py-3">
            <Image source={images.person} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              style={{ fontFamily: 'Quicksand-Regular' }}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>
        </View>

        {/* Email Input */}
        <View>
          <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
            Email
          </Text>
          <View className="flex-row items-center bg-gray-300 rounded-full px-4 py-3">
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

        {/* Phone Input */}
        <View>
          <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
            Phone Number
          </Text>
          <View className="flex-row items-center bg-gray-300 rounded-full px-4 py-3">
            <Image source={images.phone} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              style={{ fontFamily: 'Quicksand-Regular' }}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
        </View>

        {/* Password Input */}
        <View>
          <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
            Password
          </Text>
          <View className="flex-row items-center bg-gray-300 rounded-full px-4 py-3">
            <Image source={images.user} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              style={{ fontFamily: 'Quicksand-Regular' }}
              placeholder="Create a password"
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

        {/* Confirm Password Input */}
        <View>
          <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-Medium' }}>
            Confirm Password
          </Text>
          <View className="flex-row items-center bg-gray-300 rounded-full px-4 py-3">
            <Image source={images.user} className="size-5 mr-3" resizeMode="contain" tintColor="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              style={{ fontFamily: 'Quicksand-Regular' }}
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text className="text-sm text-gray-600" style={{ fontFamily: 'Quicksand-Medium' }}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className="bg-red-500 rounded-xl py-4 mt-4"
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center text-lg font-semibold" style={{ fontFamily: 'Quicksand-Bold' }}>
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-gray-600 text-base" style={{ fontFamily: 'Quicksand-Regular' }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/Signin')}>
            <Text className="text-red-500 text-base font-semibold" style={{ fontFamily: 'Quicksand-Bold' }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default Signup