// Import environment variables from @env (loaded by react-native-dotenv)
import {
  // App Firebase config
  EXPO_PUBLIC_APP_FIREBASE_API_KEY,
  EXPO_PUBLIC_APP_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_APP_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_APP_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_APP_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_APP_FIREBASE_APP_ID,
  EXPO_PUBLIC_APP_FIREBASE_MEASUREMENT_ID,

  // Partner Firebase config
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} from '@env';

// Export environment variables with fallbacks from hardcoded values
export const ENV = {
  // App Firebase config
  APP_FIREBASE_API_KEY: EXPO_PUBLIC_APP_FIREBASE_API_KEY || "AIzaSyDfiOTZxtSEckw2_S7kU2ffcb6mnFyLNaM",
  APP_FIREBASE_AUTH_DOMAIN: EXPO_PUBLIC_APP_FIREBASE_AUTH_DOMAIN || "vahaka-app.firebaseapp.com",
  APP_FIREBASE_PROJECT_ID: EXPO_PUBLIC_APP_FIREBASE_PROJECT_ID || "vahaka-app",
  APP_FIREBASE_STORAGE_BUCKET: EXPO_PUBLIC_APP_FIREBASE_STORAGE_BUCKET || "vahaka-app.firebasestorage.app",
  APP_FIREBASE_MESSAGING_SENDER_ID: EXPO_PUBLIC_APP_FIREBASE_MESSAGING_SENDER_ID || "691118656995",
  APP_FIREBASE_APP_ID: EXPO_PUBLIC_APP_FIREBASE_APP_ID || "1:691118656995:web:4a7b832f1db22bc8d724d6",
  APP_FIREBASE_MEASUREMENT_ID: EXPO_PUBLIC_APP_FIREBASE_MEASUREMENT_ID || "G-6TGFXY087C",

  // Partner Firebase config
  FIREBASE_API_KEY: EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyD3tGW_fK2ftokDXzc2q1MoCmqE3YwzWxw",
  FIREBASE_AUTH_DOMAIN: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "vahaka-partner.firebaseapp.com",
  FIREBASE_PROJECT_ID: EXPO_PUBLIC_FIREBASE_PROJECT_ID || "vahaka-partner",
  FIREBASE_STORAGE_BUCKET: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "vahaka-partner.appspot.com",
  FIREBASE_MESSAGING_SENDER_ID: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "403161680709",
  FIREBASE_APP_ID: EXPO_PUBLIC_FIREBASE_APP_ID || "1:403161680709:web:d2f12ccd57ea8ba91f8c2c",
  FIREBASE_MEASUREMENT_ID: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-36YZYCTBQP",
};

// Export a function to check if all required env variables are set
export const validateEnv = () => {
  const requiredVars = [
    'APP_FIREBASE_API_KEY',
    'APP_FIREBASE_AUTH_DOMAIN',
    'APP_FIREBASE_PROJECT_ID',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter(key => !ENV[key]);

  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(", ")}`);
    console.warn("Using hardcoded fallback values instead");
    return false;
  }

  console.log("Environment variables loaded successfully");
  return true;
};

// Log environment status on import
console.log("Env module loaded, variables status:", {
  appApiKey: ENV.APP_FIREBASE_API_KEY ? "exists" : "missing",
  appProjectId: ENV.APP_FIREBASE_PROJECT_ID,
  partnerApiKey: ENV.FIREBASE_API_KEY ? "exists" : "missing",
  partnerProjectId: ENV.FIREBASE_PROJECT_ID,
}); 