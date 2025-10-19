import { Stack } from "expo-router";
import "./globals.css";
import {useFonts} from "expo-font";
import {useEffect} from "react";

export default function RootLayout() {
  return <Stack screenOptions={{headerShown: false}} />;
}
