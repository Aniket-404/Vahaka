import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, CollectionReference, DocumentReference } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';

// Define the FirestoreUser interface
interface FirestoreUser {
  id: string;
  profile: {
    name: string;
    email: string;
    createdAt: Date;
    [key: string]: any;
  };
}

// Define Auth context types
interface AuthContextType {
  user: any | null;
  userData: FirestoreUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  signIn: async () => null,
  signUp: async () => null,
  logOut: async () => {},
  resetPassword: async () => {},
  refreshUserData: async () => {}
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (uid: string): Promise<FirestoreUser | null> => {
    try {
      console.log(`Fetching user data from users collection for UID: ${uid}`);
      
      // Check if db is initialized
      if (!db) {
        console.error('Firestore db not initialized');
        return null;
      }
      
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log(`User document found in users collection for UID: ${uid}`);
        return {
          id: userDoc.id,
          profile: userDoc.data().profile
        } as unknown as FirestoreUser; // Type assertion to bypass type check
      }
      
      console.error(`No user document found in users collection for UID: ${uid}`);
      return null;
    } catch (error) {
      console.error(`Error fetching user data from users collection for UID: ${uid}:`, error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (user) {
      const userData = await fetchUserData(user.uid);
      setUserData(userData);
    }
  };

  useEffect(() => {
    // Check if auth is initialized
    if (!auth) {
      console.error('Firebase auth not initialized');
      setIsLoading(false);
      return () => {};
    }
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        const userData = await fetchUserData(authUser.uid);
        setUserData(userData);
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Check if auth is initialized
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      
      // Format the email (trim whitespace and convert to lowercase)
      const formattedEmail = email.toLowerCase().trim();
      
      // First try to authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
      
      // Check if db is initialized
      if (!db) {
        throw new Error('Database is not initialized');
      }
      
      // Then verify the user exists in our database
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // If no user document exists, sign them out
        await signOut(auth);
        throw new Error('Your account was not found in our database. Please sign up first.');
      }
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Handle Firebase auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later or reset your password.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      }
      
      throw error;
    }
  };

  // Create new user with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if auth is initialized
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      
      // Format the email (trim whitespace and convert to lowercase)
      const formattedEmail = email.toLowerCase().trim();
      
      // First create the authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
      const user = userCredential.user;
      
      try {
        // Check if db is initialized
        if (!db) {
          throw new Error('Database is not initialized');
        }
        
        // Create user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          profile: {
            name: name,
            email: formattedEmail,
            createdAt: new Date()
          }
        });
        
        console.log('User document created successfully:', user.uid);
        return user;
      } catch (firestoreError: any) {
        console.error('Error creating user document:', firestoreError);
        
        if (firestoreError.code === 'permission-denied' || 
            firestoreError.message.includes('Missing or insufficient permissions')) {
          // If Firestore permissions are the issue, we'll still return the user
          // They can still use the app with limited functionality
          console.warn('Created auth user but could not write to Firestore. User may have limited functionality.');
          return user;
        } else {
          // For other Firestore errors, try to delete the auth account to clean up
          try {
            await user.delete();
          } catch (deleteError) {
            console.error('Failed to delete auth user after Firestore error:', deleteError);
          }
          throw new Error('Could not complete registration. Database access failed.');
        }
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // Handle Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    isLoading,
    signIn,
    signUp,
    logOut,
    resetPassword,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Adding default export as required by Expo Router
export default function Auth() {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {() => null}
      </AuthContext.Consumer>
    </AuthProvider>
  );
} 