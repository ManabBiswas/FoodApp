import { Redirect } from "expo-router";

export default function Index() {
  // Replace with real authentication logic
  const isAuthenticated = true;
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Index" />;
  }
  
  return <Redirect href="/(auth)/Signin" />;
}
