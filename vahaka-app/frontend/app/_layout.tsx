import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { AppState, AppStateStatus, Platform, Alert, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './context/auth';
import { testFirestoreConnection } from './services/firebaseConfig';
import initializeFirestore from './services/initFirestore';
import { getApps, initializeApp } from 'firebase/app';
import { db, auth, appFirebase } from './services/firebaseConfig';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component checks if the user is authenticated
// If they're not, redirect them to the auth (login) stack
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [firestoreStatus, setFirestoreStatus] = useState({ tested: false, working: true });
  const [firestoreInitialized, setFirestoreInitialized] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Ensure Firebase is initialized when the app starts
  useEffect(() => {
    const checkFirebaseStatus = async () => {
      try {
        console.log('Checking Firebase initialization status...');
        
        // Check if Firebase app exists and is initialized
        if (appFirebase) {
          console.log('Firebase app is already initialized');
          setFirebaseReady(true);
          
          // Initialize Firestore collections
          await initializeFirestore();
          setFirestoreInitialized(true);
        } else {
          console.error('Firebase app is not initialized');
          Alert.alert(
            'Firebase Error',
            'Firebase was not initialized properly. Some features may not work correctly.'
          );
        }
      } catch (error) {
        console.error('Error checking Firebase status:', error);
      }
    };
    
    checkFirebaseStatus();
  }, []);
  
  useEffect(() => {
    // Test Firestore connection when component mounts
    const checkFirestore = async () => {
      if (!firebaseReady) return;
      
      const result = await testFirestoreConnection();
      if (!result.success) {
        console.warn('Firestore connection issue:', result.message);
        setFirestoreStatus({ tested: true, working: false });
        
        // Show alert about Firebase configuration issues
        Alert.alert(
          'Firebase Configuration Issue',
          'The app is having trouble connecting to the database. ' +
          'This may be due to incorrect API keys or Firestore security rules. ' +
          'Please check your Firebase configuration.',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      } else {
        setFirestoreStatus({ tested: true, working: true });
      }
    };
    
    if (!isLoading && user && firebaseReady) {
      checkFirestore();
    }
  }, [user, isLoading, firebaseReady]);
  
  useEffect(() => {
    if (isLoading) return;
    
    // Check if the path is in the auth group
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to the login page
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to the home page
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);
  
  // Show the database connection warning banner if there's an issue
  if (firestoreStatus.tested && !firestoreStatus.working && user) {
    return (
      <>
        <View style={{ 
          backgroundColor: '#FFCC00', 
          padding: 10, 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: '#000', fontWeight: 'bold' }}>
            ⚠️ Database connection issue. Some features may not work.
          </Text>
        </View>
        {children}
      </>
    );
  }
  
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Monitor app state to ensure native modules are only used when the app is active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App is now active and ready to use native modules
        console.log('App is active and ready to use native modules');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="(profile)" 
                options={{ 
                  headerShown: false,
                  headerStyle: {
                    backgroundColor: '#FFFFFF',
                  },
                  headerTintColor: '#2563EB',
                  headerTitleStyle: {
                    fontWeight: '600',
                  }
                }} 
              />
              <Stack.Screen 
                name="driver-details" 
                options={{ 
                  headerShown: true, 
                  title: "Driver Details",
                  headerStyle: {
                    backgroundColor: '#FFFFFF',
                  },
                  headerTintColor: '#2563EB',
                  headerTitleStyle: {
                    fontWeight: '600',
                  },
                }} 
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
