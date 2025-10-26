import CustomInput from '@/components/CustomInput'
import { images } from '@/constants'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required'
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
      isValid = false
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
      isValid = false
    } else if (phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignUp = () => {
    if (validateForm()) {
      console.log('Sign up with:', { name, email, phone, password })
      router.replace('/(auth)/Signin')
    }
  }

  return (
    <ScrollView className="flex-1 px-6 pt-20 pb-8" showsVerticalScrollIndicator={false}>
      <View className="mb-10">
        <Text className="text-4xl font-bold text-primary mb-3 font-quicksand-bold" >
          Create Account 🎉
        </Text>
        <Text className="text-lg text-gray-600 font-quicksand-regular">
          Sign up to start ordering
        </Text>
      </View>

      <View>
        <CustomInput
          label="Full Name"
          icon={images.person}
          placeholder="Enter your full name"
          value={name}
          onChangeText={(text) => {
            setName(text)
            setErrors({ ...errors, name: '' })
          }}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
        />

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
          label="Phone Number"
          icon={images.phone}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text)
            setErrors({ ...errors, phone: '' })
          }}
          keyboardType="phone-pad"
          autoComplete="tel"
          error={errors.phone}
        />

        <CustomInput
          label="Password"
          icon={images.user}
          placeholder="Create a password"
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

        <CustomInput
          label="Confirm Password"
          icon={images.user}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text)
            setErrors({ ...errors, confirmPassword: '' })
          }}
          autoCapitalize="none"
          autoComplete="password"
          isPassword
          error={errors.confirmPassword}
        />

        <TouchableOpacity
          className="bg-red-500 rounded-2xl py-4 mt-2 shadow-lg shadow-red-500/50"
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center text-lg font-semibold" style={{ fontFamily: 'Quicksand-Bold' }}>
            Create Account
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center mt-8">
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