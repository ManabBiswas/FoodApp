import { images } from "@/constants";
import { router } from "expo-router";
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
// import {useCartStore} from "@/store/cart.store";

const CartButton = () => {
    // const { getTotalItems } = useCartStore();
    const totalItems = 17;

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
            {totalItems > 0 && (
                <View className='cart-badge' >
                    <Text className='small-bold text-white '>{totalItems}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}
export default CartButton