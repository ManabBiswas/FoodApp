import { images } from "@/constants";
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
// import {useCartStore} from "@/store/cart.store";

const CartButton = () => {
    // const { getTotalItems } = useCartStore();
    const totalItems = 17;

    return (
        <TouchableOpacity className='cart-btn ' onPress={() => { }}>
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