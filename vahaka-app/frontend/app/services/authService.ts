import { getAuth, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Default export to satisfy Expo Router
export default () => null; 