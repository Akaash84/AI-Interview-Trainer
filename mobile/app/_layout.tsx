// added comment by vinay kumar

import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import Constants from 'expo-constants'
import { useFonts } from 'expo-font'
import { Slot, SplashScreen } from 'expo-router'
import { StatusBar } from 'react-native'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // Load fonts or other resources
  const [loaded] = useFonts({
    // You could add custom fonts here if needed
  })

  // Get the publishable key from environment variables
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY 

  useEffect(() => {
    // Hide splash screen when resources are loaded
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
      >
        <Slot />
      </ClerkProvider>
    </SafeAreaProvider>
  )
}
