import { View, Text, Image } from 'react-native';
import { images } from '@/constants';

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