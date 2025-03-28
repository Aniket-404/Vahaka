import { useEffect, useState } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { User } from 'firebase/auth';
import { authService } from '../services';
import { COLORS } from '../constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
      SplashScreen.hideAsync();
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    
    if (!user && !inAuthGroup) {
      // Redirect to auth flow if not logged in
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to main app if logged in
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  // While loading, don't render anything
  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="trip/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
} 