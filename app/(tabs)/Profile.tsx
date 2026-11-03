import { Skeleton } from '@/components/Skeleton'
import { images } from '@/constants'
import { useAddress } from '@/contexts/AddressContext'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { formatAddressLabel } from '@/utils/address'
import { showAlert } from '@/utils/alert'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback } from 'react'
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const INK = '#181C2E'
const MUTED = '#6F6B64'
const CREAM = '#F7F3EC'
const ORANGE = '#FE8C00'

type MembershipTier = 'regular' | 'gold' | 'platinum'

const MEMBERSHIP: Record<
  MembershipTier,
  { label: string; background: string; color: string }
> = {
  regular: { label: 'Regular member', background: '#F1EEE8', color: '#5F5B54' },
  gold: { label: 'Gold member', background: '#FFF0BE', color: '#8A5A00' },
  platinum: { label: 'Platinum member', background: '#E6EDF7', color: '#334A6B' },
}

const MENU_ITEMS = [
  {
    title: 'Rate Us',
    subtitle: 'Tell us how we are doing',
    icon: images.star,
    tint: '#A67C00',
    background: '#FFF3C4',
  },
  {
    title: 'Terms & Conditions',
    subtitle: 'The fine print',
    icon: images.check,
    tint: '#5B6B7A',
    background: '#EDF1F5',
  },
]

interface BentoTileProps {
  title: string
  subtitle?: string
  icon: ImageSourcePropType
  tint: string
  background: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
  compact?: boolean
  large?: boolean
}

function BentoTile({
  title,
  subtitle,
  icon,
  tint,
  background,
  onPress,
  style,
  compact = false,
  large = false,
}: BentoTileProps) {
  const iconBoxSize = compact ? 36 : 48

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress}
      className={`justify-between overflow-hidden ${
        compact ? 'p-3.5 rounded-[24px]' : 'p-5 rounded-[30px]'
      }`}
      style={[{ backgroundColor: background }, style]}
    >
      <View
        className="items-center justify-center"
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: compact ? 12 : 16,
          backgroundColor: '#FFFFFFB8',
        }}
      >
        <Image
          source={icon}
          resizeMode="contain"
          style={{ width: compact ? 16 : 20, height: compact ? 16 : 20, tintColor: tint }}
        />
      </View>

      {large ? (
        <Image
          pointerEvents="none"
          source={icon}
          resizeMode="contain"
          style={{
            position: 'absolute',
            right: -18,
            bottom: 22,
            width: 112,
            height: 112,
            opacity: 0.1,
            tintColor: tint,
          }}
        />
      ) : null}

      <View>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'Quicksand-Bold',
            color: INK,
            fontSize: large ? 22 : compact ? 14 : 16,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Quicksand-Medium',
              color: MUTED,
              fontSize: compact ? 10 : 12,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {large ? (
        <Image
          source={images.arrowRight}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: 16,
            right: 18,
            width: 36,
            height: 36,
            tintColor: tint,
          }}
        />
      ) : null}
    </TouchableOpacity>
  )
}

function ProfileSkeleton() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: CREAM }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 pt-3 pb-4 flex-row items-end justify-between">
          <View>
            <Skeleton className="h-3 w-20 rounded-full mb-2" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </View>
          <Skeleton className="w-11 h-11 rounded-full" />
        </View>

        <View className="mx-5 rounded-[30px] px-4 py-4" style={{ backgroundColor: '#E9E5DE' }}>
          <View className="flex-row items-center">
            <Skeleton className="w-16 h-16 rounded-[19px]" />
            <View className="flex-1 ml-3.5">
              <Skeleton className="h-4 w-32 rounded-full mb-2" />
              <Skeleton className="h-3 w-44 rounded-full mb-2" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </View>
            <Skeleton className="w-9 h-9 rounded-full" />
          </View>
        </View>

        <Skeleton className="mx-5 mt-4 h-40 rounded-[32px]" />

        <View className="mx-5 mt-3 flex-row" style={{ height: 216 }}>
          <Skeleton className="rounded-[30px]" style={{ flex: 1.12, marginRight: 12 }} />
          <View style={{ flex: 0.88 }} className="justify-between">
            <Skeleton className="rounded-[24px]" style={{ flex: 1, marginBottom: 12 }} />
            <Skeleton className="rounded-[24px]" style={{ flex: 1 }} />
          </View>
        </View>

        <View className="px-5 mt-7">
          <Skeleton className="h-3 w-24 rounded-full mb-3" />
          <Skeleton className="h-14 w-full rounded-[24px] mb-3" />
          <Skeleton className="h-14 w-full rounded-[24px]" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default function Profile() {
  const { user, logout, refreshUser, isLoading } = useAuth()
  const { balance, transactions } = useWallet()
  const { addresses, defaultAddress } = useAddress()

  useFocusEffect(
    useCallback(() => {
      refreshUser()
    }, [refreshUser])
  )

  const handleLogout = async () => {
    try {
      let confirmed: boolean

      if (Platform.OS === 'web') {
        const webConfirm = (globalThis as { confirm?: (message: string) => boolean }).confirm
        confirmed = webConfirm ? webConfirm('Are you sure you want to log out?') : true
      } else {
        confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Log out', style: 'destructive', onPress: () => resolve(true) },
          ])
        })
      }

      if (!confirmed) return

      await logout()
      router.replace('/(auth)/Signin')
    } catch (error: any) {
      showAlert('Logout Error', error.message || 'Failed to logout. Please try again.')
    }
  }

  const handleMenuItemPress = (title: string) => {
    switch (title) {
      case 'Rate Us':
        showAlert('Coming Soon', 'Rating the app will be available soon.')
        break
      case 'Terms & Conditions':
        showAlert('Coming Soon', 'Terms and conditions will be available soon.')
        break
      default:
        showAlert('Coming Soon', `${title} will be available soon!`)
    }
  }

  if (isLoading || !user) {
    return <ProfileSkeleton />
  }

  const membership = MEMBERSHIP[user.membershipType] ?? MEMBERSHIP.regular
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  const addressSubtitle = defaultAddress
    ? `${formatAddressLabel(defaultAddress.label)} · ${defaultAddress.city}`
    : addresses.length > 0
      ? `${addresses.length} saved`
      : 'Add your first'
  const transactionCount = transactions.length

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: CREAM }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text
            className="text-[11px] tracking-[2px]"
            style={{ fontFamily: 'Quicksand-Bold', color: '#9A958C' }}
          >
            MY ACCOUNT
          </Text>
          <Text
            className="text-3xl mt-1"
            style={{ fontFamily: 'Quicksand-Bold', color: INK }}
          >
            Profile
          </Text>
        </View>

        {/* Profile tile */}
        <View
          className="mx-5 rounded-[30px] px-4 py-4 overflow-hidden"
          style={{ backgroundColor: INK }}
        >
          <View
            className="absolute rounded-full"
            style={{
              width: 120,
              height: 120,
              top: -60,
              right: -30,
              backgroundColor: ORANGE,
              opacity: 0.18,
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 90,
              height: 90,
              bottom: -50,
              left: -20,
              backgroundColor: ORANGE,
              opacity: 0.12,
            }}
          />

          <View className="flex-row items-center">
            <View
              className="items-center justify-center rounded-[22px]"
              style={{
                width: 69,
                height: 69,
                backgroundColor: ORANGE,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Quicksand-Bold',
                  fontSize: 24,
                  color: '#FFFFFF',
                }}
              >
                {initials}
              </Text>
            </View>

            <View className="flex-1 ml-3.5">
              <Text
                numberOfLines={1}
                className="text-xl text-white"
                style={{ fontFamily: 'Quicksand-Bold' }}
              >
                {user.name}
              </Text>
              <Text
                numberOfLines={1}
                className="text-[11px] mt-0.5"
                style={{ fontFamily: 'Quicksand-Medium', color: '#B8B5C0' }}
              >
                {user.email}
              </Text>
              <View
                className="self-start mt-1.5 px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: membership.background }}
              >
                <Text
                  className="text-[10px]"
                  style={{ fontFamily: 'Quicksand-Bold', color: membership.color }}
                >
                  {membership.label}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              activeOpacity={0.8}
              onPress={() => router.push('/edit-profile')}
              className="flex-row items-center rounded-full px-3 py-2"
              style={{ backgroundColor: '#FFFFFF1F' }}
            >
              <Image
                source={images.pencil}
                resizeMode="contain"
                style={{ width: 13, height: 13, tintColor: '#FFFFFF' }}
              />
              <Text
                className="text-[11px] ml-1.5"
                style={{ fontFamily: 'Quicksand-Bold', color: '#FFFFFF' }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet banner */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Wallet balance ₹${balance.toFixed(2)}. Open wallet`}
          activeOpacity={0.9}
          onPress={() => router.push('/wallet')}
          className="mx-5 mt-4 rounded-[32px] p-5 overflow-hidden"
          style={{ backgroundColor: ORANGE }}
        >
          <View
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              top: -90,
              right: -50,
              backgroundColor: '#FFFFFF',
              opacity: 0.16,
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              bottom: -60,
              right: 40,
              backgroundColor: '#D96B00',
              opacity: 0.35,
            }}
          />

          <View className="flex-row items-start justify-between">
            <View>
              <Text
                className="text-[11px] tracking-[1.5px]"
                style={{ fontFamily: 'Quicksand-Bold', color: '#FFF3E2' }}
              >
                WALLET BALANCE
              </Text>
              <Text
                className="text-4xl mt-1 text-white"
                style={{ fontFamily: 'Quicksand-Bold' }}
              >
                ₹{balance.toFixed(2)}
              </Text>
            </View>

            <View
              className="w-11 h-11 rounded-2xl items-center justify-center"
              style={{ backgroundColor: '#FFFFFF2E' }}
            >
              <Image
                source={images.rupee}
                resizeMode="contain"
                style={{ width: 20, height: 20, tintColor: '#FFFFFF' }}
              />
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-5">
            <View className="flex-row items-center rounded-full px-4 py-2 bg-white">
              <Image
                source={images.plus}
                resizeMode="contain"
                style={{ width: 14, height: 14, marginRight: 6, tintColor: ORANGE }}
              />
              <Text
                className="text-sm"
                style={{ fontFamily: 'Quicksand-Bold', color: ORANGE }}
              >
                Add money
              </Text>
            </View>

            <Text
              className="text-[11px]"
              style={{ fontFamily: 'Quicksand-Medium', color: '#FFF3E2' }}
            >
              {transactionCount === 0
                ? 'No transactions yet'
                : `${transactionCount} recent transaction${transactionCount === 1 ? '' : 's'}`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bento grid */}
        <View className="flex-row mx-5 mt-3" style={{ height: 216 }}>
          <BentoTile
            title="Orders"
            subtitle="Track deliveries"
            icon={images.bag}
            tint="#C2551F"
            background="#FFE6D5"
            onPress={() => router.push('/orders')}
            large
            style={{ flex: 1.12, marginRight: 12 }}
          />

          <View style={{ flex: 0.88 }} className="justify-between">
            <BentoTile
              title="Favorites"
              subtitle="Saved dishes"
              icon={images.star}
              tint="#A67C00"
              background="#FFF3C4"
              onPress={() => router.push('/favorites')}
              compact
              style={{ flex: 1, marginBottom: 12 }}
            />
            <BentoTile
              title="Addresses"
              subtitle={addressSubtitle}
              icon={images.location}
              tint="#2F7D53"
              background="#DFF3E7"
              onPress={() => router.push('/addresses')}
              compact
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Account section */}
        <View className="px-5 mt-7 mb-3">
          <Text
            className="text-lg"
            style={{ fontFamily: 'Quicksand-Bold', color: INK }}
          >
            Account
          </Text>
        </View>

        <View className="mx-5 flex-row" style={{ height: 118 }}>
          <BentoTile
            title="Notifications"
            subtitle="Updates & offers"
            icon={images.envelope}
            tint="#B77900"
            background="#FFF3D6"
            onPress={() =>
              showAlert('Coming Soon', 'Notification settings will be available soon.')
            }
            compact
            style={{ flex: 1, marginRight: 12 }}
          />
          <BentoTile
            title="Support"
            subtitle="We are here to help"
            icon={images.phone}
            tint="#2E6B9E"
            background="#E2EFFB"
            onPress={() =>
              showAlert('Help & Support', 'Email us at manabbiswas108108@gmail.com')
            }
            compact
            style={{ flex: 1 }}
          />
        </View>

        {/* Preferences */}
        <View className="px-5 mt-7 mb-3">
          <Text
            className="text-lg"
            style={{ fontFamily: 'Quicksand-Bold', color: INK }}
          >
            Preferences
          </Text>
        </View>

        <View className="mx-5 bg-white rounded-[28px] overflow-hidden shadow-sm">
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              activeOpacity={0.7}
              onPress={() => handleMenuItemPress(item.title)}
              className={`flex-row items-center px-4 py-4 ${
                index !== MENU_ITEMS.length - 1 ? 'border-b border-[#F0ECE5]' : ''
              }`}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: item.background }}
              >
                <Image
                  source={item.icon}
                  resizeMode="contain"
                  style={{ width: 20, height: 20, tintColor: item.tint }}
                />
              </View>

              <View className="flex-1 ml-3">
                <Text
                  className="text-sm"
                  style={{ fontFamily: 'Quicksand-SemiBold', color: INK }}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-[11px] mt-0.5"
                  style={{ fontFamily: 'Quicksand-Medium', color: '#9A958C' }}
                >
                  {item.subtitle}
                </Text>
              </View>

              <Image
                source={images.arrowRight}
                resizeMode="contain"
                style={{ width: 32, height: 32, tintColor: '#B7B2A9' }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View className="px-5 mt-5">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Log out"
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-white rounded-2xl py-4 flex-row items-center justify-center border border-[#F3D4CE]"
          >
            <Image
              source={images.logout}
              resizeMode="contain"
              style={{ width: 20, height: 20, marginRight: 8, tintColor: '#D9534F' }}
            />
            <Text
              className="text-base"
              style={{ fontFamily: 'Quicksand-Bold', color: '#D9534F' }}
            >
              Log out
            </Text>
          </TouchableOpacity>

          <Text
            className="text-center text-[11px] mt-4"
            style={{ fontFamily: 'Quicksand-Regular', color: '#A9A49B' }}
          >
            FoodApp · Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
