import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { User as FirestoreUser } from '../types/user';

// Define Auth context types
interface AuthContextType {
  user: any | null;
  userData: FirestoreUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async (email: string, password: string, name: string) => {},
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
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          profile: userDoc.data().profile
        } as FirestoreUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Create new user with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profile: {
          name: name,
          email: email,
          createdAt: new Date()
        }
      });
      
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
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