// Shared Firebase configuration file for the entire app
// This file now supports two Firebase projects: one for the user app and one for partner data

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDoc } from 'firebase/firestore';
import Constants from 'expo-constants';

import { ENV, validateEnv } from './env';

// Validate environment variables are available
validateEnv();

// Vahaka App Firebase configuration (for user authentication and user data)
const appFirebaseConfig = {
  apiKey: ENV.APP_FIREBASE_API_KEY,
  authDomain: ENV.APP_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.APP_FIREBASE_PROJECT_ID,
  storageBucket: ENV.APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.APP_FIREBASE_APP_ID,
  measurementId: ENV.APP_FIREBASE_MEASUREMENT_ID
};

// Vahaka Partner Firebase configuration (for driver data access only)
const partnerFirebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID, 
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID
};

// Log configuration for debugging
console.log('App Firebase Config:', {
  apiKey: appFirebaseConfig.apiKey ? 'exists' : 'missing',
  authDomain: appFirebaseConfig.authDomain,
  projectId: appFirebaseConfig.projectId,
});

console.log('Partner Firebase Config:', {
  apiKey: partnerFirebaseConfig.apiKey ? 'exists' : 'missing',
  authDomain: partnerFirebaseConfig.authDomain,
  projectId: partnerFirebaseConfig.projectId,
});

// Initialize the Firebase apps
let appFirebase: FirebaseApp | null = null;
let partnerFirebase: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: any = null;
let partnerDb: Firestore | null = null;

// Safe initialization function for Firebase apps
const initializeFirebaseApps = () => {
  try {
    console.log('Safely initializing Firebase apps...');
    
    // Check if Firebase has been initialized
    const existingApps = getApps();
    console.log(`Found ${existingApps.length} existing Firebase apps`);
    
    let appFb: FirebaseApp;
    let partnerFb: FirebaseApp;
    
    if (!existingApps.length) {
      // First initialization
      console.log('Initializing Firebase apps for the first time');
      appFb = initializeApp(appFirebaseConfig, 'app');
      partnerFb = initializeApp(partnerFirebaseConfig, 'partner');
    } else {
      // Firebase already initialized, get the instances
      console.log('Firebase apps already initialized, getting instances');
      try {
        appFb = getApp('app');
        console.log('Retrieved existing app Firebase instance');
      } catch (e) {
        console.log('Initializing app Firebase instance');
        appFb = initializeApp(appFirebaseConfig, 'app');
      }
      
      try {
        partnerFb = getApp('partner');
        console.log('Retrieved existing partner Firebase instance');
      } catch (e) {
        console.log('Initializing partner Firebase instance');
        partnerFb = initializeApp(partnerFirebaseConfig, 'partner');
      }
    }
    
    console.log('Firebase apps initialized successfully');
    return { appFb, partnerFb };
  } catch (error) {
    console.error('Error initializing Firebase apps:', error);
    throw error;
  }
};

// Initialize Firebase
try {
  const { appFb, partnerFb } = initializeFirebaseApps();
  appFirebase = appFb;
  partnerFirebase = partnerFb;
  
  // Initialize Firebase services
  db = getFirestore(appFirebase);
  auth = getAuth(appFirebase);
  storage = getStorage(appFirebase);
  partnerDb = getFirestore(partnerFirebase);
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Critical error initializing Firebase:', error);
  // Services will remain null, applications should handle this case
}

// Test Firestore connection
const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // First check if Firebase is initialized
    if (!db) {
      console.error('Firestore not initialized, attempting recovery');
      try {
        const { appFb } = initializeFirebaseApps();
        db = getFirestore(appFb);
      } catch (e) {
        return { 
          success: false, 
          error: 'initialization',
          message: 'Firestore is not initialized. Please restart the app.'
        };
      }
    }
    
    // Try to get a non-existent document to test permissions
    const testCollection = collection(db, '__test_connection');
    const testDoc = doc(testCollection, 'test');
    await getDoc(testDoc);
    console.log('Firestore read successful');
    return { success: true };
  } catch (error: any) {
    console.error('Firestore connection test failed:', error.message);
    if (error.message.includes('Missing or insufficient permissions')) {
      console.warn('Firestore permissions issue detected. Check security rules.');
      return { 
        success: false, 
        error: 'permissions',
        message: 'Firestore permissions not configured correctly. Check security rules in Firebase console.'
      };
    }
    return { 
      success: false, 
      error: 'unknown',
      message: error.message
    };
  }
};

// Define constants for app type
export const APP_TYPE = {
  USER: 'vahaka-app',
  PARTNER: 'vahaka-partner',
};

// Set the current app type
export const CURRENT_APP_TYPE = APP_TYPE.USER;

export { db, auth, storage, appFirebase, partnerDb, partnerFirebase, testFirestoreConnection };

// Default export to satisfy Expo Router
export default () => null; 