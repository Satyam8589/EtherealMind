import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up function
  const signup = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Signing up user: ${email}`);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: displayName || email.split('@')[0]
      });
      
      // Add additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        role: "user",
        createdAt: new Date().toISOString(),
        profileLinks: {
          website: '',
          twitter: '',
          instagram: ''
        },
        bio: ''
      });
      
      console.log("User signed up successfully:", user.email);
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
      
      // Input validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }
      
      // Normal login flow
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential || !userCredential.user) {
        throw new Error('Login failed - no user returned');
      }
      
      // Get additional user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Merge Firebase Auth user with Firestore data
          userCredential.user.userData = userData;
        }
      } catch (firestoreError) {
        console.error("Error fetching user data from Firestore:", firestoreError);
        // Don't throw here, just log the error
      }
      
      console.log("User logged in successfully:", userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      handleLoginError(error);
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
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error.message || "Failed to log out. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error) => {
    let errorMessage = "Failed to log in. Please check your credentials.";
    
    if (!error || !error.code) {
      errorMessage = error?.message || "An unexpected error occurred. Please try again.";
    } else {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please sign up first.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Invalid login credentials. Please check and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed login attempts. Please try again later or reset your password.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format. Please check and try again.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = error.message || "An unexpected error occurred. Please try again.";
      }
    }
    
    setError(errorMessage);
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
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;