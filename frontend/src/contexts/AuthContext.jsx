import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      try {
        console.log("Checking for user in localStorage...");
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log("User found in localStorage:", parsedUser.email);
          setCurrentUser(parsedUser);
        } else {
          console.log("No user found in localStorage");
        }
      } catch (err) {
        console.error("Error loading user from localStorage:", err);
        setError("Failed to restore your session. Please login again.");
      } finally {
        // Always set loading to false after attempting to load the user
        setLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, []);

  // Sign up function
  const signup = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Signing up user: ${email}`);
      
      // Create user object
      const user = {
        uid: generateUniqueId(),
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      
      console.log("User signed up successfully:", user);
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to sign up. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Logging in user: ${email}`);
      
      // In a real app, we would validate credentials here
      // For this demo, we'll just create a user object
      const user = {
        uid: generateUniqueId(),
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      
      console.log("User logged in successfully:", user);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to log in. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      console.log("Logging out user...");
      
      // Clear user from localStorage
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error.message || "Failed to log out. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate a unique ID
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const contextValue = {
    currentUser,
    loading,
    error,
    setError,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 