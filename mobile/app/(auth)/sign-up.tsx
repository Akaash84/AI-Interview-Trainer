import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import userApiService from '../../server/services/userApi';
import GoogleAuth from '../components/GoogleAuth';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // Only email and password fields are required for authentication
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    // Start sign-up process using email and password only
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        
        // After successful verification, save user to database
        try {
          console.log('✅ Sign-up verified, saving user to database...');
          
          // Get user info from the completed sign-up
          const userId = signUpAttempt.createdUserId || signUpAttempt.createdSessionId;
          
          const userData = {
            clerkId: userId!,
            email: emailAddress,
            firstName: '', // Can be extended with form fields later
            lastName: '',
          };

          const dbResult = await userApiService.createUser(userData);
          
          if (dbResult.success) {
            console.log('✅ User successfully saved to database:', dbResult.user);
            Alert.alert('Success', 'Account created and synced with database!');
          } else {
            console.warn('⚠️ Failed to save user to database:', dbResult.message);
            // Still allow user to proceed, database sync can happen later
            Alert.alert('Warning', 'Account created but database sync failed. You can continue using the app.');
          }
        } catch (dbError: any) {
          console.error('❌ Database error during signup:', dbError);
          // Still allow user to proceed
          Alert.alert('Warning', 'Account created but database sync failed. You can continue using the app.');
        }
        
        router.replace('/(home)');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Failed to verify email. Please try again.');
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
          {pendingVerification ? (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Verify your email</Text>
                <Text style={styles.subHeader}>Enter the verification code sent to your email</Text>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={code}
                  placeholder="Verification code"
                  placeholderTextColor="#888"
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={onVerifyPress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={async () => {
                  try {
                    await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
                    Alert.alert('Success', 'Verification code resent.');
                  } catch (err) {
                    console.error(err);
                    Alert.alert('Error', 'Failed to resend verification code.');
                  }
                }}
              >
                <Text style={styles.resendButtonText}>Resend code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Create Account</Text>
                <Text style={styles.subHeader}>Sign up to get started</Text>
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
                style={styles.button} 
                onPress={onSignUpPress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <GoogleAuth />

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signInLink}>Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          )}
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 0.48,
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
  button: {
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: '#dd2476',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#ff512f',
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  signInText: {
    color: '#cfd9df',
    fontSize: 15,
    fontWeight: '500',
  },
  signInLink: {
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
});