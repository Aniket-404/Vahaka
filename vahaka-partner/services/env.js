// Environment variable getter with fallback to .env.example values
const getEnvVariable = (key) => {
  // First try to get from process.env (React Native / Expo)
  const envValue = process.env[key];
  if (envValue) return envValue;
  
  // Fallback values from .env.example (for GitHub and development)
  const fallbackValues = {
    FIREBASE_API_KEY: "AIzaSyD3tGW_fK2ftokDXzc2q1MoCmqE3YwzWxw",
    FIREBASE_AUTH_DOMAIN: "vahaka-partner.firebaseapp.com",
    FIREBASE_PROJECT_ID: "vahaka-partner",
    FIREBASE_STORAGE_BUCKET: "vahaka-partner.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "403161680709",
    FIREBASE_APP_ID: "1:403161680709:web:d2f12ccd57ea8ba91f8c2c",
    FIREBASE_MEASUREMENT_ID: "G-36YZYCTBQP",
    EXPO_PUBLIC_API_URL: "https://api.example.com"
  };
  
  return fallbackValues[key] || null;
};

// Export environment variables
export const ENV = {
  FIREBASE_API_KEY: getEnvVariable("FIREBASE_API_KEY"),
  FIREBASE_AUTH_DOMAIN: getEnvVariable("FIREBASE_AUTH_DOMAIN"),
  FIREBASE_PROJECT_ID: getEnvVariable("FIREBASE_PROJECT_ID"),
  FIREBASE_STORAGE_BUCKET: getEnvVariable("FIREBASE_STORAGE_BUCKET"),
  FIREBASE_MESSAGING_SENDER_ID: getEnvVariable("FIREBASE_MESSAGING_SENDER_ID"),
  FIREBASE_APP_ID: getEnvVariable("FIREBASE_APP_ID"),
  FIREBASE_MEASUREMENT_ID: getEnvVariable("FIREBASE_MEASUREMENT_ID"),
  API_URL: getEnvVariable("EXPO_PUBLIC_API_URL")
};

// Export a function to check if all required env variables are set
export const validateEnv = () => {
  const requiredVars = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET", 
    "FIREBASE_APP_ID"
  ];
  
  const missingVars = requiredVars.filter(key => !ENV[key]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(", ")}`);
    return false;
  }
  
  return true;
}; 