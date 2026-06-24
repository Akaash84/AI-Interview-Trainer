import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import userApiService from '../../server/services/userApi';
import GoogleAuth from '../components/GoogleAuth';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    
    if (!emailAddress.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        
        // After successful Clerk authentication, check if user exists in database
        try {
          console.log('✅ Sign-in successful, checking database...');
          
          // We'll use email to check since we don't have direct access to user ID here
          // The user ID will be available from useUser hook after setActive
          const dbResult = await userApiService.checkUserExists({
            clerkId: signInAttempt.createdSessionId!, // Temporary identifier
            email: emailAddress,
          });
          
          if (dbResult.success) {
            console.log('✅ User found in database:', dbResult.user);
            Alert.alert('Welcome back!', 'Successfully signed in and synced with database.');
          } else if (dbResult.shouldRedirectToSignup) {
            console.log('⚠️ User not found in database, creating entry...');
            // Create user entry for existing Clerk users who aren't in DB yet
            const createResult = await userApiService.createUser({
              clerkId: signInAttempt.createdSessionId!, // Temporary identifier
              email: emailAddress,
              firstName: '',
              lastName: '',
            });
            
            if (createResult.success) {
              console.log('✅ User created in database during signin:', createResult.user);
              Alert.alert('Account Synced', 'Your account has been synced with our database.');
            } else {
              console.warn('⚠️ Failed to create user in database:', createResult.message);
              Alert.alert('Warning', 'Sign-in successful but database sync failed. You can continue using the app.');
            }
          } else {
            console.warn('⚠️ Database check failed:', dbResult.message);
            Alert.alert('Warning', 'Sign-in successful but database check failed. You can continue using the app.');
          }
        } catch (dbError: any) {
          console.error('❌ Database error during signin:', dbError);
          Alert.alert('Warning', 'Sign-in successful but database sync failed. You can continue using the app.');
        }
        
        router.replace('/(home)');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError('Sign-in process incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.subHeader}>Sign in to continue</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={emailAddress}
                placeholder="Email address"
                placeholderTextColor="#888"
                onChangeText={setEmailAddress}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={true}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={onSignInPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <GoogleAuth />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  // For gradients, use a gradient component in the parent view. Fallback color:
  backgroundColor: '#1e3c72',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: '#2a5298',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subHeader: {
    fontSize: 18,
    color: '#cfd9df',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2a5298',
    shadowColor: '#2a5298',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
    color: '#2a5298',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 17,
    color: '#1e3c72',
    fontWeight: '500',
  },
  loginButton: {
  // For gradients, use a gradient component in the parent view. Fallback color:
  backgroundColor: '#ff512f',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#dd2476',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: '#dd2476',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: '#cfd9df',
    borderRadius: 2,
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: '#2a5298',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  signupText: {
    color: '#cfd9df',
    fontSize: 15,
    fontWeight: '500',
  },
  signupLink: {
    color: '#ff512f',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 47, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff512f',
  },
  errorText: {
    color: '#ff512f',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 0,
    padding: 10,
  },
});