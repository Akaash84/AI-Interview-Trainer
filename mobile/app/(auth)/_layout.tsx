import { useAuth } from '@clerk/clerk-expo'
import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(home)')
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <div style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '6px solid #fff',
          borderTop: '6px solid #ff512f',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Don't redirect here, let useEffect handle it
  if (isSignedIn) {
    return null;
  }

  return <Stack />
}