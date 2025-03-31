// This file is deprecated, use firebaseConfig.ts instead
import { app, db, auth } from './firebaseConfig';

export { app, db, auth };

// Default export to satisfy Expo Router
export default function Firebase() {
  return null;
} 