import CustomInput from '@/components/CustomInput'
import { images } from '@/constants'
import { authService } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const Signin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: '', password: '' }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignIn = async () => {
    try {
      if (validateForm()) {
        setLoading(true)
        
        // Call API
        const response = await authService.login(email, password)
        
        if (response.status === 'success') {
          // Store token and user data
          await AsyncStorage.setItem('userToken', response.data.token)
          await AsyncStorage.setItem('userData', JSON.stringify(response.data))
          
          Alert.alert('Success', 'Login successful!', [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/Index')
            }
          ])
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      Alert.alert('Sign in error', error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled">
      <View className="flex-1 px-6 pt-20 pb-6">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-primary mb-3 font-quicksand-bold" >
            Welcome Back! 👋
          </Text>
          <Text className="text-lg text-gray-600 font-quicksand-medium" >
            Sign in to continue your delicious journey
          </Text>
        </View>

        <View>
          <CustomInput
            label="Email Address"
            icon={images.envelope}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setErrors({ ...errors, email: '' })
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />

          <CustomInput
            label="Password"
            icon={images.user}
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setErrors({ ...errors, password: '' })
            }}
            autoCapitalize="none"
            autoComplete="password"
            isPassword
            error={errors.password}
          />

          <TouchableOpacity className="self-end -mt-2 mb-6">
            <Text className="text-sm text-red-500" style={{ fontFamily: 'Quicksand-SemiBold' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 rounded-2xl py-4 shadow-lg shadow-red-500/50"
            onPress={handleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold" style={{ fontFamily: 'Quicksand-Bold' }}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-8">
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