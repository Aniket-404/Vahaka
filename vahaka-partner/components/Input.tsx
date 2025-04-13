import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONTS, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  onBlur,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.errorInput,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : null,
            multiline ? styles.multiline : null,
            secureTextEntry ? styles.passwordInput : null,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <View style={styles.eyeButtonInner}>
              <Text style={styles.eyeButtonText}>
                {isPasswordVisible ? 'HIDE' : 'SHOW'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.surfaceVariant,
    opacity: 0.7,
  },
  leftIcon: {
    paddingLeft: SPACING.md,
  },
  rightIcon: {
    paddingRight: SPACING.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.xs,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  eyeButtonInner: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  eyeButtonText: {
    color: COLORS.surface,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
  passwordInput: {
    paddingRight: 80, // Make space for the toggle button
  },
}); 