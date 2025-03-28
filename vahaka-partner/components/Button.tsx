import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, SPACING, FONTS, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.disabled;
    if (variant === 'outline') return 'transparent';
    
    switch (variant) {
      case 'secondary': return COLORS.secondary;
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textSecondary;
    if (variant === 'outline') {
      switch (variant) {
        case 'secondary': return COLORS.secondary;
        case 'success': return COLORS.success;
        case 'warning': return COLORS.warning;
        case 'error': return COLORS.error;
        default: return COLORS.primary;
      }
    }
    return COLORS.surface;
  };

  const getBorderColor = () => {
    if (disabled) return COLORS.disabled;
    switch (variant) {
      case 'secondary': return COLORS.secondary;
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return SPACING.sm;
      case 'large': return SPACING.lg;
      default: return SPACING.md;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return FONT_SIZES.sm;
      case 'large': return FONT_SIZES.lg;
      default: return FONT_SIZES.md;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          padding: getPadding(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? getBorderColor() : undefined,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  text: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
}); 