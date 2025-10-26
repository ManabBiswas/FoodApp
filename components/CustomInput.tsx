import React, { useState } from 'react'
import { Image, ImageSourcePropType, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'

interface CustomInputProps extends TextInputProps {
  label: string
  icon?: ImageSourcePropType
  error?: string
  isPassword?: boolean
}

const CustomInput = ({ 
  label, 
  icon, 
  error, 
  isPassword = false,
  ...props 
}: CustomInputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Quicksand-SemiBold' }}>
        {label}
      </Text>
      <View 
        className={`flex-row items-center rounded-2xl px-4 py-3.5 ${
          error ? 'bg-red-50 border border-red-300' : 'bg-gray-50'
        }`}
      >
        {icon && (
          <Image 
            source={icon} 
            className="size-5 mr-3" 
            resizeMode="contain" 
            tintColor={error ? "#EF4444" : "#6B7280"} 
          />
        )}
        <TextInput
          className="flex-1 text-base text-gray-900"
          style={{ fontFamily: 'Quicksand-Regular', paddingVertical: 0 }}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2 px-2"
            activeOpacity={0.7}
          >
            <Text 
              className={`text-sm ${error ? 'text-red-500' : 'text-gray-600'}`} 
              style={{ fontFamily: 'Quicksand-SemiBold' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1 ml-1" style={{ fontFamily: 'Quicksand-Medium' }}>
          {error}
        </Text>
      )}
    </View>
  )
}

export default CustomInput
