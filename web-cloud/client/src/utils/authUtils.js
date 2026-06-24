// Utility for making authenticated API calls with automatic logout on 401
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  try {
    const response = await fetch(url, requestOptions);
    
    // If unauthorized, clear auth data and redirect to signin
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if we're not already on public pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/signin', '/signup', '/pricing', '/contactus', '/aboutus'];
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/signin';
      }
      
      throw new Error('Unauthorized - please sign in again');
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Hook for making authenticated API calls
export const useAuthenticatedFetch = () => {
  return makeAuthenticatedRequest;
};
