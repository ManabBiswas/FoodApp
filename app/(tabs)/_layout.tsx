import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Slot } from 'expo-router'

export default function _layout() {
  const isAuthenticated = false; // Replace with real authentication logic
    if(!isAuthenticated) return <Redirect href="/sign-in" />
  return (
    <Slot />
  )
}