import { getAuth, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  if (!auth) {
    console.error('Auth is not initialized');
    throw new Error('Authentication service is not initialized');
  }
  await signOut(auth);
};

// Default export to satisfy Expo Router
export default () => null; 