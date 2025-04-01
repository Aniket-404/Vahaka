import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import ThemedText from '../components/ThemedText';
import ThemedView from '../components/ThemedView';

// Dummy implementation for demo purposes
const sendSupportRequest = async (data: any): Promise<void> => {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Support request sent:', data);
      resolve();
    }, 1500);
  });
};

export default function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendSupportRequest({
        subject,
        message,
        timestamp: new Date(),
      });
      
      Alert.alert(
        'Request Sent',
        'Your support request has been sent. We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error sending support request:', error);
      Alert.alert('Error', 'Failed to send support request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Contact Support',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#2563EB',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={60} color="#2563EB" />
          </View>
          <ThemedText style={styles.headerTitle}>How can we help?</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Our support team is here to assist you with any questions or issues.
          </ThemedText>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Subject</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Booking Issue, App Problem"
                placeholderTextColor="#94A3B8"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Message</ThemedText>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={styles.textArea}
                placeholder="Please describe your issue in detail"
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Send Message</ThemedText>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactInfoContainer}>
          <ThemedText style={styles.contactInfoTitle}>Other ways to reach us</ThemedText>
          
          <View style={styles.contactMethod}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={24} color="#2563EB" />
            </View>
            <View style={styles.contactDetails}>
              <ThemedText style={styles.contactLabel}>Phone Support</ThemedText>
              <ThemedText style={styles.contactValue}>+91 9876543210</ThemedText>
              <ThemedText style={styles.contactHours}>Available: 9 AM - 6 PM (Mon-Sat)</ThemedText>
            </View>
          </View>
          
          <View style={styles.contactMethod}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color="#2563EB" />
            </View>
            <View style={styles.contactDetails}>
              <ThemedText style={styles.contactLabel}>Email</ThemedText>
              <ThemedText style={styles.contactValue}>support@vahaka.com</ThemedText>
              <ThemedText style={styles.contactHours}>Response within 24 hours</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconContainer: {
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    color: '#1E293B',
  },
  textAreaContainer: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  textArea: {
    fontSize: 16,
    color: '#1E293B',
    height: 120,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  contactInfoContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 16,
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 4,
  },
  contactHours: {
    fontSize: 12,
    color: '#64748B',
  },
}); 