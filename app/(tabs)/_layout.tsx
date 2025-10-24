import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'

export default function _layout() {
    if(!isAuthenticated) return <Redirect href="/sign-in" />
  return (
    <Slot />
  )
}