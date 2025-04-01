import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function ProfileLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        headerBackTitle: '',
        headerBackVisible: true,
        headerTitleAlign: 'center',
        contentStyle: {
          // Removed padding that was causing the blank space
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: 'Edit Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payment-methods"
        options={{
          title: 'Payment Methods',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 