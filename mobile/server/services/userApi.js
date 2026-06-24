// API service for user operations with the backend server
const API_BASE_URL = process.env.API_BASE_URL || 'https://b2ml3pp5-4000.inc1.devtunnels.ms/api';

class UserApiService {
  // Create user after successful Clerk signup
  async createUser(userData) {
    try {
      // Logging for debugging
      console.log(`📝 Creating user at: ${API_BASE_URL}/users/signup`);
      console.log(`🔄 Request payload: ${JSON.stringify(userData)}`);
      
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log(`🔄 Response status: ${response.status}`);
      const result = await response.json();
      console.log(`🔄 Response data: ${JSON.stringify(result)}`);
      
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Failed to create user in database',
      };
    }
  }

  // Check if user exists during signin
  async checkUserExists(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking user:', error);
      return {
        success: false,
        message: 'Failed to check user in database',
      };
    }
  }

  // Get user by Clerk ID
  async getUserByClerkId(clerkId) {
    try {
      // Logging for debugging
      console.log(`🔍 Fetching user from: ${API_BASE_URL}/users/${clerkId}`);
      
      const response = await fetch(`${API_BASE_URL}/users/${clerkId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting user:', error);
      return {
        success: false,
        message: 'Failed to get user from database',
      };
    }
  }

  // Update user profile
  async updateUser(clerkId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${clerkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Failed to update user in database',
      };
    }
  }

  // Test server connection
  async testConnection() {
    try {
      console.log(`🔌 Testing connection to server: ${API_BASE_URL}/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log(`🔄 Health check response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`❌ Server responded with error status: ${response.status}`);
        return false;
      }
      
      const result = await response.json();
      console.log(`✅ Server health check result: ${JSON.stringify(result)}`);
      
      return result.status === 'OK';
    } catch (error) {
      const errorMessage = error.name === 'AbortError' 
        ? 'Connection timed out' 
        : `Connection failed: ${error.message}`;
      console.error(`❌ Server health check failed: ${errorMessage}`);
      return false;
    }
  }
}

export default new UserApiService();