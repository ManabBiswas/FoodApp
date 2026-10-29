import { images } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { addressService } from '@/services/api';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

interface Address {
  _id: string;
  label: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

const emptyForm = {
  label: 'home' as Address['label'],
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
};

export default function Addresses() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;

    try {
      const response = await addressService.getAll(token);
      if (response.status === 'success') {
        setAddresses(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      Alert.alert('Error', error.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const validate = () => {
    if (
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zipCode.trim() ||
      !form.country.trim()
    ) {
      Alert.alert('Missing Fields', 'Please fill in the complete address.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!token || !validate()) return;

    try {
      setSaving(true);
      const response = await addressService.create(form, token);
      if (response.status === 'success') {
        setAddresses((current) => [...current, response.data]);
        setForm(emptyForm);
        setShowForm(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!token) return;

    try {
      await addressService.delete(addressId, token);
      setAddresses((current) => current.filter((address) => address._id !== addressId));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete address');
    }
  };

  const renderAddress = (address: Address) => (
    <View key={address._id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-quicksand-bold text-gray-800 capitalize">
          {address.label}
        </Text>
        <View className="flex-row items-center gap-3">
          {address.isDefault && (
            <View className="bg-green-50 px-2 py-1 rounded-full">
              <Text className="text-green-600 text-xs font-quicksand-semibold">Default</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => handleDelete(address._id)}>
            <Image source={images.trash} className="size-5" resizeMode="contain" tintColor="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="font-quicksand-regular text-gray-600">
        {address.street}, {address.city}
      </Text>
      <Text className="font-quicksand-regular text-gray-600">
        {address.state} {address.zipCode}, {address.country}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Image source={images.arrowBack} className="size-5" resizeMode="contain" tintColor="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-quicksand-bold text-gray-800 flex-1">
          Delivery Addresses
        </Text>
        <TouchableOpacity
          onPress={() => setShowForm((current) => !current)}
          className="bg-red-500 rounded-full px-4 py-2"
        >
          <Text className="text-white font-quicksand-semibold text-sm">
            {showForm ? 'Cancel' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {showForm && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="font-quicksand-bold text-gray-800 mb-3">New Address</Text>

            <View className="flex-row gap-2 mb-2">
              {(['home', 'work', 'other'] as const).map((label) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => setForm((current) => ({ ...current, label }))}
                  className={`flex-1 py-2 rounded-xl items-center ${
                    form.label === label ? 'bg-red-500' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`font-quicksand-semibold capitalize ${
                      form.label === label ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              value={form.street}
              onChangeText={(street) => setForm((current) => ({ ...current, street }))}
            />
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
              placeholder="City"
              placeholderTextColor="#9CA3AF"
              value={form.city}
              onChangeText={(city) => setForm((current) => ({ ...current, city }))}
            />
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
              placeholder="State"
              placeholderTextColor="#9CA3AF"
              value={form.state}
              onChangeText={(state) => setForm((current) => ({ ...current, state }))}
            />
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 mb-2 font-quicksand-medium text-gray-800"
              placeholder="Zip code"
              placeholderTextColor="#9CA3AF"
              value={form.zipCode}
              onChangeText={(zipCode) => setForm((current) => ({ ...current, zipCode }))}
              keyboardType="number-pad"
            />
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 mb-3 font-quicksand-medium text-gray-800"
              placeholder="Country"
              placeholderTextColor="#9CA3AF"
              value={form.country}
              onChangeText={(country) => setForm((current) => ({ ...current, country }))}
            />

            <TouchableOpacity
              onPress={handleAdd}
              disabled={saving}
              className="bg-red-500 rounded-xl py-3 items-center"
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-quicksand-bold">Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#EF4444" className="mt-10" />
        ) : addresses.length === 0 ? (
          <View className="items-center mt-16">
            <Image source={images.location} className="w-20 h-20 mb-4" resizeMode="contain" tintColor="#9CA3AF" />
            <Text className="text-xl font-quicksand-bold text-gray-800">No addresses yet</Text>
            <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-2">
              Add an address to speed up checkout.
            </Text>
          </View>
        ) : (
          addresses.map(renderAddress)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
