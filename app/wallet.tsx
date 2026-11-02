import { Skeleton, WalletTransactionSkeleton } from '@/components/Skeleton';
import { images } from '@/constants';
import { useWallet, WalletTransaction } from '@/contexts/WalletContext';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOP_UP_AMOUNTS = [100, 500, 1000];
const MAX_TOP_UP = 50000;

export default function Wallet() {
  const {
    balance,
    transactions,
    isLoading,
    error,
    refreshWallet,
    topUp,
  } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(500);
  const [toppingUp, setToppingUp] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshWallet();
    }, [refreshWallet])
  );

  const parsedAmount = selectedPreset ?? Number(amount);
  const topUpAmount = Number.isFinite(parsedAmount)
    ? Math.round(parsedAmount * 100) / 100
    : 0;
  const showBalanceSkeleton = isLoading && transactions.length === 0;

  const handlePreset = (value: number) => {
    setSelectedPreset(value);
    setAmount('');
    setFeedback(null);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value.replace(/[^0-9.]/g, ''));
    setSelectedPreset(null);
    setFeedback(null);
  };

  const handleTopUp = async () => {
    if (topUpAmount <= 0) {
      setFeedback({
        type: 'error',
        message: 'Enter an amount greater than ₹0.',
      });
      return;
    }

    if (topUpAmount > MAX_TOP_UP) {
      setFeedback({
        type: 'error',
        message: `A single top-up cannot exceed ₹${MAX_TOP_UP}.`,
      });
      return;
    }

    try {
      setToppingUp(true);
      setFeedback(null);

      const nextBalance = await topUp(topUpAmount);

      setFeedback({
        type: 'success',
        message: `₹${topUpAmount.toFixed(2)} added. New balance: ₹${nextBalance.toFixed(2)}.`,
      });
      setAmount('');
      setSelectedPreset(null);
    } catch (requestError: any) {
      setFeedback({
        type: 'error',
        message: requestError.message || 'Failed to add money. Try again.',
      });
    } finally {
      setToppingUp(false);
    }
  };

  const renderTransaction = (transaction: WalletTransaction) => {
    const isCredit = transaction.type !== 'debit';
    const icon =
      transaction.type === 'debit'
        ? '🛍️'
        : transaction.type === 'refund'
          ? '↩️'
          : '➕';

    return (
      <View
        key={transaction._id}
        className="bg-white rounded-2xl p-4 mb-2 border border-gray-100 flex-row items-center"
      >
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isCredit ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <Text className="text-lg">{icon}</Text>
        </View>

        <View className="flex-1">
          <Text className="font-quicksand-semibold text-gray-800">
            {transaction.description}
          </Text>
          <Text className="font-quicksand-regular text-gray-400 text-xs mt-1">
            {new Date(transaction.createdAt).toLocaleString()}
          </Text>
        </View>

        <Text
          className={`font-quicksand-bold ${
            isCredit ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {isCredit ? '+' : '-'}₹{Number(transaction.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Image
            source={images.arrowBack}
            className="size-5"
            resizeMode="contain"
            tintColor="#1F2937"
          />
        </TouchableOpacity>
        <Text className="text-2xl font-quicksand-bold text-gray-800">Wallet</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance */}
        <View className="bg-primary rounded-3xl p-6 mb-5">
          <Text className="text-white text-sm font-quicksand-medium opacity-80">
            Wallet Balance
          </Text>

          {showBalanceSkeleton ? (
            <Skeleton className="h-10 w-40 rounded-xl mt-2 bg-white/20" />
          ) : (
            <Text className="text-white text-4xl font-quicksand-bold mt-1">
              ₹{balance.toFixed(2)}
            </Text>
          )}

          <Text className="text-white text-xs font-quicksand-regular mt-3 opacity-80">
            Use your wallet at checkout. Wallet orders are deducted instantly,
            and cancellations are refunded automatically.
          </Text>
        </View>

        {/* Top up */}
        <View className="bg-white rounded-3xl p-5 mb-5 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-quicksand-bold text-gray-800">
              Add Money
            </Text>
            <View className="bg-amber-50 px-3 py-1 rounded-full">
              <Text className="text-amber-600 text-xs font-quicksand-semibold">
                Demo top-up
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-3">
            {TOP_UP_AMOUNTS.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => handlePreset(value)}
                activeOpacity={0.8}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  selectedPreset === value
                    ? 'bg-red-500 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`font-quicksand-bold ${
                    selectedPreset === value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  ₹{value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 mb-3 font-quicksand-medium text-gray-800"
            placeholder="Or enter a custom amount"
            placeholderTextColor="#9CA3AF"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            inputMode="decimal"
          />

          {feedback && (
            <View
              className={`rounded-xl px-4 py-3 mb-3 ${
                feedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <Text
                className={`text-sm font-quicksand-semibold ${
                  feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {feedback.message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleTopUp}
            disabled={toppingUp}
            activeOpacity={0.8}
            className={`rounded-xl py-3 items-center ${
              toppingUp ? 'bg-red-300' : 'bg-red-500'
            }`}
          >
            {toppingUp ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-quicksand-bold">
                {topUpAmount > 0
                  ? `Add ₹${topUpAmount.toFixed(2)}`
                  : 'Add Money'}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-xs font-quicksand-regular text-gray-400 mt-3 text-center">
            No payment gateway is connected yet, so top-ups are credited
            instantly for development.
          </Text>
        </View>

        {/* Transactions */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-quicksand-bold text-gray-800">
            Transactions
          </Text>
          <TouchableOpacity onPress={refreshWallet} disabled={isLoading}>
            <Text className="text-sm font-quicksand-semibold text-red-500">
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        {error && !isLoading && (
          <View className="bg-red-50 rounded-2xl p-4 mb-3 border border-red-100">
            <Text className="font-quicksand-semibold text-red-600">{error}</Text>
            <TouchableOpacity onPress={refreshWallet} className="mt-2 self-start">
              <Text className="font-quicksand-bold text-red-500">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && transactions.length === 0 ? (
          <View>
            {Array.from({ length: 3 }).map((_, index) => (
              <WalletTransactionSkeleton key={index} />
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <View className="items-center mt-8 bg-white rounded-3xl p-8 border border-gray-100">
            <Image
              source={images.rupee}
              className="w-16 h-16 mb-3"
              resizeMode="contain"
              tintColor="#9CA3AF"
            />
            <Text className="text-lg font-quicksand-bold text-gray-800">
              No transactions yet
            </Text>
            <Text className="text-sm font-quicksand-regular text-gray-500 text-center mt-2">
              Add money to your wallet and it will show up here.
            </Text>
          </View>
        ) : (
          transactions.map(renderTransaction)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
