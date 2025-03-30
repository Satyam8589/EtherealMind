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
      
      // Get existing users or initialize empty object
      const savedUserData = localStorage.getItem('users') ? 
        JSON.parse(localStorage.getItem('users')) : {};
      
      // Check if user already exists
      if (savedUserData[email]) {
        throw { code: 'auth/email-already-in-use', message: 'Email already in use' };
      }
      
      // Generate a unique ID for the user
      const uid = generateUniqueId();
      
      // Create user object with password (in a real app, we would hash the password)
      const newUser = {
        uid,
        email,
        password, // In a real app, this would be hashed
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      // Add user to users object
      savedUserData[email] = newUser;
      
      // Save updated users to localStorage
      localStorage.setItem('users', JSON.stringify(savedUserData));
      
      // Create user object without password for current session
      const user = {
        uid,
        email,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt
      };
      
      // Save to localStorage for session
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
      console.log(`Attempting to log in user: ${email}`);
      
      // Get stored user data
      const savedUserData = localStorage.getItem('users') ? 
        JSON.parse(localStorage.getItem('users')) : {};
      
      // Check if user exists
      if (!savedUserData[email]) {
        throw { code: 'auth/user-not-found', message: 'No user found with this email' };
      }
      
      // Validate password (in a real app, we would use proper password hashing)
      if (savedUserData[email].password !== password) {
        throw { code: 'auth/wrong-password', message: 'Incorrect password' };
      }
      
      // Create user object without the password
      const user = {
        uid: savedUserData[email].uid,
        email,
        displayName: savedUserData[email].displayName,
        createdAt: savedUserData[email].createdAt
      };
      
      // Save to localStorage for session
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