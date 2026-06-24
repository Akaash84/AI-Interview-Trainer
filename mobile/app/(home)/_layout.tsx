import { useAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useUserDatabase } from '../../server/hooks/useUserDatabase';

export default function HomeLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { dbUser, loading, error } = useUserDatabase();
  const router = useRouter();

  // Log database sync status for debugging
  useEffect(() => {
    if (error) {
      console.error('❌ Database sync error:', error);
    }
    if (dbUser) {
      console.log('✅ User synced to database:', dbUser);
    }
  }, [dbUser, error]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while auth is loading
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // Don't redirect here, let useEffect handle it
  if (!isSignedIn) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  )
}