import { View, Text } from 'react-native'
import React from 'react'
import { images } from '@/constants';
import { Image } from 'react-native';

const Cart = () => {
  return (
    <View>
      <Image source={images.bag} />
      <Text>Cart</Text>
    </View>
  )
}

export default Cart