import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    }
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

const GoogleAuth = () => {
  useWarmUpBrowser();
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'mobile' // Use your app scheme from app.json
      });
      
      console.log("Google OAuth redirect URL:", redirectUrl);
      
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: redirectUrl,
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        console.log('✅ Google OAuth successful, redirecting to home...');
        router.replace('/(home)');
      } else {
        Alert.alert("Authentication", "Failed to complete authentication. Please try again.");
      }
    } catch (err: any) {
      console.error("Google OAuth error:", JSON.stringify(err, null, 2));
      Alert.alert("Authentication Error", err?.message || "Failed to sign in with Google");
    }
  }, []);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={onPress}>
      <View style={styles.googleButtonContent}>
        <Ionicons name="logo-google" size={24} color="#4285F4" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default GoogleAuth;
