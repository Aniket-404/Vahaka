import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedViewProps = ViewProps & {
  lightBg?: string;
  darkBg?: string;
};

export default function ThemedView(props: ThemedViewProps) {
  const { style, lightBg, darkBg, ...otherProps } = props;
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? darkBg || '#121212' : lightBg || '#FFFFFF';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
