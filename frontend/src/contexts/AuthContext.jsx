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
      
      // Generate a unique ID for the user
      const uid = generateUniqueId();
      
      // Create full user object with password
      const newUser = {
        uid,
        email,
        password, // In a real app, this would be hashed
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        profileLinks: {
          website: '',
          twitter: '',
          instagram: ''
        },
        bio: ''
      };
      
      // Get existing users or initialize empty object
      const savedUserData = localStorage.getItem('users') ? 
        JSON.parse(localStorage.getItem('users')) : {};
      
      // Check if user already exists
      if (savedUserData[email]) {
        throw { code: 'auth/email-already-in-use', message: 'Email already in use' };
      }
      
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
      
      // Always create demo user if it doesn't exist
      ensureDefaultUsers();
      
      // For demo purposes, allow login with any credentials
      // This ensures everyone can login regardless of localStorage issues
      if (email === 'demo@example.com' && password === 'password123') {
        // Use the demo user
        const demoUser = {
          uid: 'demo-user-1',
          email: 'demo@example.com',
          displayName: 'Demo User',
          createdAt: new Date().toISOString()
        };
        
        // Save to localStorage for session
        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        setCurrentUser(demoUser);
        
        console.log("Demo user logged in successfully");
        return demoUser;
      }
      
      // Check if users data exists in localStorage
      if (!localStorage.getItem('users')) {
        console.error("No users found in localStorage");
        throw { code: 'auth/user-not-found', message: 'No user found with this email' };
      }
      
      // Get stored user data
      const savedUserData = JSON.parse(localStorage.getItem('users')); 
      
      // Debug log all registered users
      console.log("Available users:", Object.keys(savedUserData));
      
      // Check if user exists
      if (!savedUserData[email]) {
        console.error(`User with email ${email} not found`);
        throw { code: 'auth/user-not-found', message: 'No user found with this email' };
      }
      
      // Validate password (in a real app, we would use proper password hashing)
      if (savedUserData[email].password !== password) {
        console.error(`Incorrect password for user ${email}`);
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

  // Helper function to ensure default users exist for demo purposes
  const ensureDefaultUsers = () => {
    try {
      // Get existing users or initialize empty object
      const savedUserData = localStorage.getItem('users') ? 
        JSON.parse(localStorage.getItem('users')) : {};
      
      // Create default users if none exist
      if (Object.keys(savedUserData).length === 0) {
        console.log("Creating default users");
        
        // Add demo user
        const demoUser = {
          uid: 'demo-user-1',
          email: 'demo@example.com',
          password: 'password123',
          displayName: 'Demo User',
          createdAt: new Date().toISOString(),
          profileLinks: {
            website: 'https://example.com',
            twitter: 'https://twitter.com/demo',
            instagram: 'https://instagram.com/demo'
          },
          bio: 'This is a demo user account'
        };
        
        savedUserData['demo@example.com'] = demoUser;
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(savedUserData));
        console.log("Default users created");
      }
    } catch (error) {
      console.error("Error creating default users:", error);
    }
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