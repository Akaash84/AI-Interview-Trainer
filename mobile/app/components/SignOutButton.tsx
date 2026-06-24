import { useClerk } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent multiple calls
    
    try {
      setIsSigningOut(true)
      await signOut()
      // Let auth state change trigger redirect naturally
    } catch (err) {
      console.warn('Error signing out:', err)
      setIsSigningOut(false)
    }
  }

  return (
    <TouchableOpacity 
      style={[styles.signOutButton, isSigningOut && styles.disabled]} 
      onPress={handleSignOut}
      disabled={isSigningOut}
    >
      <Ionicons name="log-out-outline" size={18} color="#e53935" style={styles.icon} />
      <Text style={styles.signOutText}>{isSigningOut ? 'Signing out...' : 'Sign out'}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 6,
  },
  signOutText: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: '500',
  }
});