import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Create a proper tab bar background component with proper styling
const TabBarBackground: React.FC = () => {
  // Always call hooks at the top level, regardless of platform
  const colorScheme = useColorScheme() ?? 'light';
  
  // Rather than using early returns, use conditional styling
  return (
    <View 
      style={[
        styles.container, 
        // Only apply background color on Android
        Platform.OS === 'android' 
          ? { backgroundColor: Colors[colorScheme].background }
          : null
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  }
});

export default TabBarBackground;

// Don't export unused hooks
// export function useBottomTabOverflow() {
//   return 0;
// }
