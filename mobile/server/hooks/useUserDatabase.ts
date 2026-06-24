import { useUser } from '@clerk/clerk-expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import userApiService, { User } from '../services/userApi';

interface UseUserDatabaseResult {
  dbUser: User | null;
  loading: boolean;
  error: string | null;
  syncUserToDatabase: () => Promise<void>;
}

export const useUserDatabase = (): UseUserDatabaseResult => {
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSynced = useRef(false);

  const syncUserToDatabase = useCallback(async () => {
    if (!user || !isLoaded || hasSynced.current) return;

    setLoading(true);
    setError(null);
    hasSynced.current = true;

    try {
      console.log('🔄 Starting user sync to database for:', user.id);
      
      // First, test the server connection
      console.log('🔌 Testing server connection...');
      const isConnected = await userApiService.testConnection();
      
      if (!isConnected) {
        throw new Error('Failed to connect to the server. Please check your network connection and try again.');
      }
      
      console.log('✅ Server connection successful, proceeding with user sync');
      
      // Try to get the user from database
      const existingUserResult = await userApiService.getUserByClerkId(user.id);
      
      if (existingUserResult.success && existingUserResult.user) {
        // User exists in database
        setDbUser(existingUserResult.user);
        console.log('✅ User found in database:', {
          clerkId: existingUserResult.user.clerkId,
          email: existingUserResult.user.email,
          name: `${existingUserResult.user.firstName} ${existingUserResult.user.lastName}`
        });
      } else {
        // User doesn't exist, create them
        console.log('👤 User not found in database, creating new user...');
        
        const userData = {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        };

        console.log('📝 Creating user with data:', userData);
        const createResult = await userApiService.createUser(userData);
        
        if (createResult.success && createResult.user) {
          setDbUser(createResult.user);
          console.log('✅ User created in database:', {
            clerkId: createResult.user.clerkId,
            email: createResult.user.email,
            name: `${createResult.user.firstName} ${createResult.user.lastName}`
          });
        } else {
          throw new Error(createResult.message || 'Failed to create user in database');
        }
      }
    } catch (err: any) {
      console.error('❌ Error syncing user to database:', err);
      setError(err.message || 'Failed to sync user to database');
      hasSynced.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  // Auto-sync when user is loaded (only once)
  useEffect(() => {
    if (user && isLoaded && !hasSynced.current) {
      syncUserToDatabase();
    }
  }, [user?.id, isLoaded]); // Removed syncUserToDatabase dependency

  // Reset sync flag when user changes
  useEffect(() => {
    if (!user) {
      hasSynced.current = false;
      setDbUser(null);
      setError(null);
    }
  }, [user?.id]);

  return {
    dbUser,
    loading,
    error,
    syncUserToDatabase,
  };
};

export default useUserDatabase;
