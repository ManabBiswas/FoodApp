import { images } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Slot } from "expo-router";
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const AuthLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated) return <Redirect href="/(tabs)/Index" />

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled">
                <View className="w-full relative" style={{ height: Dimensions.get('screen').height / 2.25}}>
                    <Image source={images.loginGraphic} className="size-full rounded-b-lg" resizeMode="stretch" />
                    <Image source={images.logo} className="self-center size-48 absolute -bottom-16 z-10" />
                </View>
                <Slot />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default AuthLayout;
