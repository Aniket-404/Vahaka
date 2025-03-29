import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authService } from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReset, setIsReset] = useState(false);
  
  const router = useRouter();
  
  // Add debug log to verify screen rendering
  useEffect(() => {
    console.log('ForgotPasswordScreen rendered');
    
    return () => {
      console.log('ForgotPasswordScreen unmounted');
    };
  }, []);
  
  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setIsReset(true);
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
        error.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    console.log('Navigating back to login');
    router.push('/auth/login');
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={Platform.OS === 'ios' ? 100 : 140}
      extraHeight={120}
    >
      <View style={styles.content}>
        {isReset ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} style={{ marginBottom: SPACING.lg }} />
            <Text style={styles.title}>Email Sent!</Text>
            <Text style={styles.message}>
              We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
            </Text>
            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              style={styles.button}
              fullWidth
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error || undefined}
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.button}
              fullWidth
            />

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backButton}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
              activeOpacity={0.6}
            >
              <Text style={styles.backButtonText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    paddingBottom: SPACING.xxl,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.lg,
  },
  backButton: {
    marginTop: SPACING.xl,
    alignSelf: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
}); 