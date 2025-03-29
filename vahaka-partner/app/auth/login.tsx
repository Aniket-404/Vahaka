import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  Platform
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authService } from '../../services';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await authService.loginDriver(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Failed to log in. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navigating to forgot password screen');
    router.push('/auth/forgot-password');
  };

  const handleRegister = () => {
    console.log('Navigating to register screen');
    router.push('/auth/register');
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
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Vahaka Partner</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Driver Login</Text>
        <Text style={styles.subtitle}>Enter your credentials to continue</Text>
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        
        <View style={styles.forgotPasswordWrapper}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            activeOpacity={0.6}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          fullWidth
        />
        
        <Link href="/auth/forgot-password" style={styles.directLink} asChild>
          <TouchableOpacity style={styles.directLinkContainer}>
            <Text style={styles.directLinkText}>Reset Password (Alternative)</Text>
          </TouchableOpacity>
        </Link>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity 
            onPress={handleRegister}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            activeOpacity={0.6}
          >
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
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
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  forgotPasswordWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  forgotPasswordContainer: {
    padding: SPACING.md,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 6,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  button: {
    marginVertical: SPACING.md,
  },
  directLink: {
    marginVertical: SPACING.md,
  },
  directLinkContainer: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.success + '20',
    borderRadius: 6,
    marginTop: SPACING.md,
  },
  directLinkText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
}); 