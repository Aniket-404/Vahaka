import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'title' | 'subtitle' | 'defaultSemiBold' | 'default';
};

export default function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, type = 'default', ...otherProps } = props;
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? darkColor || '#FFFFFF' : lightColor || '#000000';
  
  const textStyle = type ? styles[type] || {} : {};

  return <Text style={[{ color }, textStyle, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  defaultSemiBold: {
    fontWeight: '600',
  },
  default: {}
});
