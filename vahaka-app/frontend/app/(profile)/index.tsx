import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useAuth } from '../context/auth';
import { logout } from '../services/authService';
import { uploadProfileImage } from '../services/userService';
import { router, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const ProfileScreen = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        if (user?.uid) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            console.error('No user data found');
            Alert.alert('Error', 'User data not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0].uri) {
        setIsLoading(true);
        try {
          await uploadProfileImage(result.assets[0].uri);
          await refreshUserData();
          Alert.alert('Success', 'Profile image updated successfully');
          setProfileImage(result.assets[0].uri);
        } catch (error) {
          Alert.alert('Error', 'Failed to update profile image');
          console.error('Upload error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      </View>

      {/* Rest of the profile content */}
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {isLoading ? (
                <View style={styles.profileImage}>
                  <ActivityIndicator size="large" color="#2563EB" />
                </View>
              ) : (
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.profile?.name || 'User')}&background=2563EB&color=fff&size=128` }
                  }
                  style={styles.profileImage}
                />
              )}
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={handlePickImage}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.name}>{userProfile?.profile?.name || 'User'}</ThemedText>
            <ThemedText style={styles.email}>{userProfile?.profile?.email || 'email@example.com'}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={24} color="#2563EB" style={styles.menuIcon} />
                <ThemedText style={styles.menuText}>Edit Profile</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/payment-methods')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="card-outline" size={24} color="#2563EB" style={styles.menuIcon} />
                <ThemedText style={styles.menuText}>Payment Methods</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" style={styles.menuIcon} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  city: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  state: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  postalCode: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1E293B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
  },
});

export default ProfileScreen; 
