import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(home)');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while auth is loading
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // Don't redirect here, let useEffect handle it
  if (isSignedIn) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, ...styles.content }}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Interview Trainer</Text>
          <Text style={styles.tagline}>Prepare for your next interview</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <Text style={styles.featureItem}>• Resume Analysis</Text>
          <Text style={styles.featureItem}>• Interview Preparation</Text>
          <Text style={styles.featureItem}>• Feedback & Suggestions</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // For gradients, use a gradient component in the parent view. Fallback color:
    backgroundColor: '#1e3c72',
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: '#2a5298',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#cfd9df',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 20,
  },
  primaryButton: {
    // For gradients, use a gradient component in the parent view. Fallback color:
    backgroundColor: '#ff512f',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#dd2476',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: '#dd2476',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#ff512f',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ff512f',
    fontSize: 18,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#2a5298',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1e3c72',
    letterSpacing: 1,
  },
  featureItem: {
    fontSize: 16,
    marginVertical: 6,
    color: '#2a5298',
    fontWeight: '500',
  },
});
