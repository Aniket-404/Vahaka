import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
    </>
  );
} 