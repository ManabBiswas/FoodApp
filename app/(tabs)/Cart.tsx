import { View, Text } from 'react-native'
import React from 'react'
import { images } from '@/constants';
import { Image } from 'react-native';

const Cart = () => {
  return (
    <View>
      <View className="flex-row items-center mb-4">

      <Image source={images.bag} />
      <Text>Cart</Text>
      </View>
      <View>
        <Text>Your cart is empty.</Text>
      </View>
    </View>
  )
}

export default Cart