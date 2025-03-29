// Environment variable types
interface EnvironmentVariables {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  API_URL: string;
}

// Import environment variables directly using react-native-dotenv
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  EXPO_PUBLIC_API_URL
} from '@env';

// Export environment variables
export const ENV: EnvironmentVariables = {
  FIREBASE_API_KEY: FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_PROJECT_ID: FIREBASE_PROJECT_ID || "",
  FIREBASE_STORAGE_BUCKET: FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID: FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: FIREBASE_APP_ID || "",
  FIREBASE_MEASUREMENT_ID: FIREBASE_MEASUREMENT_ID || "",
  API_URL: EXPO_PUBLIC_API_URL || ""
};

// Export a function to check if all required env variables are set
export const validateEnv = (): boolean => {
  const requiredVars: (keyof EnvironmentVariables)[] = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET", 
    "FIREBASE_APP_ID"
  ];
  
  const missingVars = requiredVars.filter(key => !ENV[key]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(", ")}`);
    console.warn("Please ensure you have created a .env file based on .env.example");
    return false;
  }
  
  console.log("Environment variables loaded successfully");
  return true;
}; 