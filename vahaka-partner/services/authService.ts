import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const auth = getAuth();

export const authService = {
  /**
   * Register a new driver with email and password
   */
  async registerDriver(email: string, password: string, displayName: string, phoneNumber: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Store additional user information in Firestore
      // We would typically call driverService.createDriver here, but we're keeping 
      // it separate to avoid circular dependencies
      
      return user;
    } catch (error) {
      console.error('Error registering driver:', error);
      throw error;
    }
  },

  /**
   * Login a driver with email and password
   */
  async loginDriver(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in driver:', error);
      throw error;
    }
  },

  /**
   * Logout the current driver
   */
  async logoutDriver(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out driver:', error);
      throw error;
    }
  },

  /**
   * Send a password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  /**
   * Change the current user's password
   */
  async changePassword(currentUser: User, newPassword: string): Promise<void> {
    try {
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Update the current user's profile
   */
  async updateUserProfile(currentUser: User, displayName: string): Promise<void> {
    try {
      await updateProfile(currentUser, { displayName });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Set up an auth state change listener
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}; 