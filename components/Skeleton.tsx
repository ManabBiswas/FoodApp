import React, { useEffect } from 'react';
import { Animated, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// One shared pulse drives every placeholder on screen, so a grid of skeletons
// does not spawn dozens of independent animation loops.
let sharedOpacity: Animated.Value | null = null;
let sharedPulse: Animated.CompositeAnimation | null = null;
let activeSkeletons = 0;

const getOpacity = () => {
  if (!sharedOpacity) sharedOpacity = new Animated.Value(0.55);
  return sharedOpacity;
};

const startPulse = () => {
  if (sharedPulse) return;

  const opacity = getOpacity();
  sharedPulse = Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0.45,
        duration: 650,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ])
  );
  sharedPulse.start();
};

const stopPulse = () => {
  sharedPulse?.stop();
  sharedPulse = null;
  sharedOpacity?.setValue(0.55);
};

/**
 * Pulsing placeholder block. Layout classes go on a regular `View`; the
 * animated overlay only handles the shimmer, which keeps NativeWind styling
 * predictable on native and web.
 */
export function Skeleton({ className = '', style }: SkeletonProps) {
  useEffect(() => {
    activeSkeletons += 1;
    startPulse();

    return () => {
      activeSkeletons -= 1;
      if (activeSkeletons === 0) stopPulse();
    };
  }, []);

  return (
    <View className={`overflow-hidden ${className}`} style={style}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#E5E7EB', opacity: getOpacity() }]}
      />
    </View>
  );
}

/** Two-column card placeholder matching the food grids. */
export function FoodCardSkeleton() {
  return (
    <View className="w-[48%] bg-gray-50 rounded-2xl p-3 mb-4">
      <Skeleton className="w-full h-24 rounded-xl mb-3" />
      <Skeleton className="h-3.5 w-4/5 rounded-full mb-2" />
      <Skeleton className="h-2.5 w-2/5 rounded-full mb-1" />
      <View className="flex-row justify-between items-center mt-3">
        <Skeleton className="h-3.5 w-1/3 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </View>
    </View>
  );
}

export function FoodGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {Array.from({ length: count }).map((_, index) => (
        <FoodCardSkeleton key={index} />
      ))}
    </View>
  );
}

/** Row placeholder matching the cart item layout. */
export function CartItemSkeleton() {
  return (
    <View className="border-b border-gray-200 px-4 py-4">
      <View className="flex-row gap-3">
        <Skeleton className="w-20 h-20 rounded-lg" />
        <View className="flex-1">
          <Skeleton className="h-4 w-3/4 rounded-full mb-2" />
          <Skeleton className="h-3 w-1/3 rounded-full mb-3" />
          <View className="flex-row items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="w-6 h-5 rounded" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </View>
        </View>
        <View className="items-end justify-between">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded" />
        </View>
      </View>
    </View>
  );
}

/** Card placeholder matching a single order. */
export function OrderCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-center mb-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </View>
      <Skeleton className="h-3 w-2/5 rounded-full mb-3" />
      <Skeleton className="h-3 w-3/4 rounded-full mb-2" />
      <Skeleton className="h-3 w-1/2 rounded-full mb-4" />
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </View>
    </View>
  );
}

/** Card placeholder matching a saved address. */
export function AddressCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-center mb-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="w-5 h-5 rounded" />
      </View>
      <Skeleton className="h-3 w-4/5 rounded-full mb-2" />
      <Skeleton className="h-3 w-3/5 rounded-full" />
    </View>
  );
}

/** Row placeholder matching a wallet transaction. */
export function WalletTransactionSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-2 border border-gray-100 flex-row items-center">
      <Skeleton className="w-10 h-10 rounded-full mr-3" />
      <View className="flex-1">
        <Skeleton className="h-3.5 w-3/5 rounded-full mb-2" />
        <Skeleton className="h-2.5 w-2/5 rounded-full" />
      </View>
      <Skeleton className="h-4 w-16 rounded-full" />
    </View>
  );
}
