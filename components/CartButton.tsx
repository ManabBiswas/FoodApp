import { images } from "@/constants";
import { useCart } from "@/contexts/CartContext";
import { router } from "expo-router";
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

const CartButton = () => {
    const { itemCount } = useCart();

    const handleCartPress = () => {
        try {
            console.log('Opening cart')
            // Navigate to cart tab
            router.push('/(tabs)/Cart')
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to open cart')
        }
    }

    return (
        <TouchableOpacity className='cart-btn' onPress={handleCartPress}>
            <Image
                source={images.bag}
                className="size-5"
                resizeMode="contain"
                // tintColor="#FFFFFF"
            />
            {itemCount > 0 && (
                <View className='cart-badge' >
                    <Text className='small-bold text-white '>{itemCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}
export default CartButton