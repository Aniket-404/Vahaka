import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { ENV, validateEnv } from './env';

// Validate environment variables are available
const isEnvValid = validateEnv();
if (!isEnvValid) {
  console.error("Firebase initialization may fail due to missing environment variables");
}

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID
};

// Log Firebase config for debugging (remove in production)
console.log("Firebase Config:", JSON.stringify({
  apiKey: ENV.FIREBASE_API_KEY ? "Key exists (masked)" : "Missing",
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID ? "ID exists (masked)" : "Missing",
  appId: ENV.FIREBASE_APP_ID ? "ID exists (masked)" : "Missing",
}));

// Initialize Firebase with error handling
let app, auth, db, storage;

try {
  console.log(`Initializing Firebase with project ID: ${ENV.FIREBASE_PROJECT_ID}`);
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with AsyncStorage persistence to keep users logged in
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error.message, error.stack);
  // Provide minimal fallback implementation to prevent crashes
  if (!app) console.warn("Firebase app initialization failed");
  if (!auth) console.warn("Firebase auth initialization failed");
  if (!db) console.warn("Firebase Firestore initialization failed");
  if (!storage) console.warn("Firebase storage initialization failed");
}

export { auth, db, storage }; 