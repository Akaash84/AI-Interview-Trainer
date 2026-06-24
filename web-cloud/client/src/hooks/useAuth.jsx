import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // ✅ stable checkAuthStatus
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const cachedUser = localStorage.getItem("user_data");

      if (token) {
        // Load cached user instantly
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setIsSignedIn(true);
        }

        // Validate with backend
        const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("user_data", JSON.stringify(userData));
          setIsSignedIn(true);
        } else {
          // Log the error for debugging
          const errorText = await response.text();
          console.error("Auth validation failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            apiUrl: `${API_BASE_URL}/api/auth/validate`
          });
          
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          setUser(null);
          setIsSignedIn(false);

          const currentPath = window.location.pathname;
          const publicPaths = ["/signin", "/signup", "/pricing", "/contactus", "/aboutus"];
          if (!publicPaths.includes(currentPath)) {
            window.location.href = "/signin";
          }
        }
      } else {
        setUser(null);
        setIsSignedIn(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      setUser(null);
      setIsSignedIn(false);

      const currentPath = window.location.pathname;
      const publicPaths = ["/signin", "/signup", "/pricing", "/contactus", "/aboutus"];
      if (!publicPaths.includes(currentPath)) {
        window.location.href = "/signin";
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ run only once on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        setUser(data.user);
        setIsSignedIn(true);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      return { success: false, error: "Sign in failed. Please try again." };
    }
  };

  const signUp = async (email, password, firstName, lastName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        setUser(data.user);
        setIsSignedIn(true);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Sign up failed:", error);
      return { success: false, error: "Sign up failed. Please try again." };
    }
  };

  const signOut = (navigate = null) => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setIsSignedIn(false);
    if (navigate) {
      navigate("/signin");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setIsSignedIn(false);
    window.location.href = "/signin";
  };

  const signInWithOAuth = (provider) => {
    const authUrl = `${API_BASE_URL}/api/auth/${provider}`;
    window.location.href = authUrl;
  };

  const value = {
    user,
    isSignedIn,
    isLoading,
    signIn,
    signUp,
    signOut,
    logout,
    signInWithOAuth,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
