import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform, KeyboardAvoidingView, ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';

function HomeScreen({ navigation }) {
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadDriverData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const partnerRef = doc(db, 'partners', auth.currentUser.uid);
        const partnerDoc = await getDoc(partnerRef);
        
        if (partnerDoc.exists()) {
          const data = partnerDoc.data();
          setDriver({
            name: data.profile?.name || '',
            rating: data.profile?.rating || 0,
            totalTrips: data.profile?.totalTrips || 0,
            preferences: data.preferences || {
              pricePerDay: 0,
              tripTypes: []
            }
          });
          
          // Set the online status from Firestore
          if (data.status?.isOnline !== undefined) {
            setIsOnline(data.status.isOnline);
          }
        }
      } catch (error) {
        console.error("Error loading driver data:", error);
      }
    };

    loadDriverData();
  }, []);

  const toggleOnlineStatus = async () => {
    if (!auth.currentUser) return;
    
    try {
      setUpdatingStatus(true);
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      
      // Update status in Firestore
      const partnerRef = doc(db, 'partners', auth.currentUser.uid);
      await setDoc(partnerRef, 
        { 
          status: { 
            isOnline: newStatus,
            lastUpdated: new Date().toISOString()
          }
        }, 
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating online status:", error);
      // Revert local state on error
      setIsOnline(isOnline);
      Alert.alert("Error", "Failed to update your status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear AsyncStorage first
      await AsyncStorage.removeItem('user');
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Navigate to Auth screen
      navigation.navigateToAuth();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Driver Dashboard</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <TouchableOpacity 
              style={[styles.statusButton, isOnline && styles.statusButtonActive]}
              onPress={toggleOnlineStatus}
              disabled={updatingStatus}
            >
              <FontAwesome5 
                name="circle" 
                size={12} 
                color={isOnline ? "#22C55E" : "#94A3B8"} 
              />
              <Text style={[styles.statusText, isOnline && styles.statusTextActive]}>
                {updatingStatus ? "Updating..." : isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <FontAwesome5 name="rupee-sign" size={24} color="#2563EB" />
              <Text style={styles.statValue}>₹{driver?.preferences?.pricePerDay || 0}</Text>
              <Text style={styles.statLabel}>Daily Rate</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome5 name="star" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{driver?.rating || 0}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome5 name="car" size={24} color="#10B981" />
              <Text style={styles.statValue}>{driver?.totalTrips || 0}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
              <FontAwesome5 name="history" size={40} color="#94A3B8" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby Activity</Text>
            <View style={styles.emptyState}>
              <FontAwesome5 name="map-marker-alt" size={40} color="#94A3B8" />
              <Text style={styles.emptyStateText}>No nearby activity</Text>
            </View>
          </View>
          
          {/* Add some bottom padding to account for the navigation bar */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState('Auth');

  // Load authentication state on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is stored in AsyncStorage
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Found stored user:", parsedUser.uid);
          setUser(parsedUser);
          setActiveScreen('Home');
        } else {
          // No stored user, check Firebase auth
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            console.log("Found Firebase auth user:", firebaseUser.uid);
            // Save to AsyncStorage for future sessions
            await AsyncStorage.setItem('user', JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email
            }));
            setUser(firebaseUser);
            setActiveScreen('Home');
          } else {
            console.log("No authenticated user found");
            setActiveScreen('Auth');
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setInitializing(false);
      }
    };

    checkAuthStatus();

    // Also set up Firebase auth listener for real-time updates
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User signed in
        console.log("Firebase auth changed - user signed in:", firebaseUser.uid);
        // Update AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email
        }));
        setUser(firebaseUser);
        setActiveScreen('Home');
      } else {
        // User signed out
        console.log("Firebase auth changed - user signed out");
        // Clear AsyncStorage
        await AsyncStorage.removeItem('user');
        setUser(null);
        setActiveScreen('Auth');
      }
    });

    return () => unsubscribe();
  }, []);

  // Force status bar appearance on component mount
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBarStyle('light-content');
      RNStatusBar.setBackgroundColor('#2563EB');
      RNStatusBar.setTranslucent(false);
    }
  }, []);

  const navigationProps = {
    navigateToHome: () => setActiveScreen('Home'),
    navigateToProfile: () => setActiveScreen('Profile'),
    navigateToAuth: async () => {
      // Just navigate, the actual logout happens in the component
      setActiveScreen('Auth');
    },
    replace: (screen) => setActiveScreen(screen)
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Loading your account...</Text>
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Auth':
        return <AuthScreen navigation={navigationProps} />;
      case 'Profile':
        return <ProfileScreen navigation={navigationProps} />;
      case 'Home':
      default:
        return <HomeScreen navigation={navigationProps} />;
    }
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#2563EB" translucent={false} />
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          {renderScreen()}
          
          {user && (
            <View style={styles.bottomNav}>
              <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'Home' && styles.navItemActive]}
                onPress={() => setActiveScreen('Home')}
              >
                <FontAwesome5 
                  name="home" 
                  size={20} 
                  color={activeScreen === 'Home' ? "#2563EB" : "#94A3B8"} 
                />
                <Text style={[styles.navText, activeScreen === 'Home' && styles.navTextActive]}>
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'Profile' && styles.navItemActive]}
                onPress={() => setActiveScreen('Profile')}
              >
                <FontAwesome5 
                  name="user" 
                  size={20} 
                  color={activeScreen === 'Profile' ? "#2563EB" : "#94A3B8"} 
                />
                <Text style={[styles.navText, activeScreen === 'Profile' && styles.navTextActive]}>
                  Profile
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
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
  header: {
    padding: 24,
    backgroundColor: '#2563EB',
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 6,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusButtonActive: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  statusTextActive: {
    color: '#22C55E',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  navText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  navTextActive: {
    color: '#2563EB',
  },
}); 