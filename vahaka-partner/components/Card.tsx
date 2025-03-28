import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined';
  elevation?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  elevation = 'medium',
}) => {
  const getElevation = () => {
    if (elevation === 'none') return {};
    return SHADOWS[elevation];
  };

  return (
    <View
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        getElevation(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
}); 