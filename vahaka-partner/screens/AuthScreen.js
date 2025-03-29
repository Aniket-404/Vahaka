import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    name: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || (!isForgotPassword && !formData.password)) {
      Alert.alert('Error', 'Email and password are required');
      return false;
    }
    if (!isForgotPassword && !isLogin && (!formData.phone || !formData.name)) {
      Alert.alert('Error', 'All fields are required for signup');
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isForgotPassword) {
        // Password Reset
        await sendPasswordResetEmail(auth, formData.email);
        Alert.alert(
          'Password Reset Email Sent',
          'Check your email for instructions to reset your password.',
          [{ text: 'OK', onPress: () => setIsForgotPassword(false) }]
        );
        return;
      }

      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log('Logged in:', userCredential.user.uid);
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        // Create partner document in Firestore
        const partnerRef = doc(db, 'partners', userCredential.user.uid);
        
        // Check if partner document already exists
        const partnerDoc = await getDoc(partnerRef);
        
        if (!partnerDoc.exists()) {
          // Create new partner document
          await setDoc(partnerRef, {
            auth: {
              email: formData.email,
              phone: formData.phone,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            },
            profile: {
              name: formData.name,
              status: 'pending',
              rating: 0,
              totalTrips: 0
            }
          });
        }
        
        console.log('Created new partner:', userCredential.user.uid);
      }

      // Navigate to profile screen
      navigation.navigateToHome();
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please login instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/Password authentication is not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Please choose a stronger password.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderForgotPasswordScreen = () => {
    return (
      <View style={styles.form}>
        <Text style={styles.forgotPasswordDescription}>
          Enter your email address below and we&apos;ll send you instructions to reset your password.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.resetButton, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setIsForgotPassword(false)}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
        >
          <FontAwesome5 name="arrow-left" size={14} color="#2563EB" style={styles.backIcon} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLoginForm = () => {
    return (
      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
          />
        </View>

        {isLogin && (
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity 
              style={styles.forgotLink}
              onPress={() => setIsForgotPassword(true)}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchButtonText}>
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <FontAwesome5 name="car" size={40} color="#2563EB" />
            <Text style={styles.title}>Vahaka Partner</Text>
            <Text style={styles.subtitle}>
              {isForgotPassword ? 'Reset Your Password' : 
                isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          {isForgotPassword ? renderForgotPasswordScreen() : renderLoginForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#64748B',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  textLink: {
    alignSelf: 'center',
    marginVertical: 15,
  },
  textLinkContent: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '400',
  },
  resetButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  forgotPasswordDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginTop: -5,
  },
  forgotLink: {
    padding: 2,
  },
  forgotText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '400',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
}); 