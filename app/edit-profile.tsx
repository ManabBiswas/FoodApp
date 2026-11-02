import { images } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token) {
      Alert.alert('Session expired', 'Please sign in again.');
      router.replace('/(auth)/Signin');
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing Fields', 'Name, email, and phone are required.');
      return;
    }

    try {
      setSaving(true);
      const response = await userService.updateProfile(
        { name: name.trim(), email: email.trim(), phone: phone.trim() },
        token
      );

      if (response.status === 'success') {
        updateUser(response.data);
        Alert.alert('Saved', 'Your profile has been updated.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Image source={images.arrowBack} className="size-5" resizeMode="contain" tintColor="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-quicksand-bold text-gray-800">Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="font-quicksand-semibold text-gray-600 mb-1">Full Name</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 mb-4 font-quicksand-medium text-gray-800 border border-gray-100"
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        <Text className="font-quicksand-semibold text-gray-600 mb-1">Email</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 mb-4 font-quicksand-medium text-gray-800 border border-gray-100"
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="font-quicksand-semibold text-gray-600 mb-1">Phone</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 mb-6 font-quicksand-medium text-gray-800 border border-gray-100"
          placeholder="Phone number"
          placeholderTextColor="#9CA3AF"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-red-500 rounded-2xl py-4 items-center"
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-quicksand-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
