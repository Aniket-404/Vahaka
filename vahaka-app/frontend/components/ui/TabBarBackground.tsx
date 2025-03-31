import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Create a proper tab bar background component with proper styling
const TabBarBackground: React.FC = () => {
  const colorScheme = useColorScheme() ?? 'light';
  
  // On iOS, return an empty view to let the blur effect work
  if (Platform.OS === 'ios') {
    return <View style={styles.container} />;
  }
  
  // On Android, we need a solid background
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: Colors[colorScheme].background }
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

export function useBottomTabOverflow() {
  return 0;
}
