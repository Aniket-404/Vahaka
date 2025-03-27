import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Switch,
  Text,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { driverService } from '../../services/driverService';
import { db } from '../../services/firebase';
import { Driver } from '../../types/driver';

const testConnection = async () => {
  try {
    const docRef = await addDoc(collection(db, "test"), {
      test: "Hello Firebase!"
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

export default function HomeScreen() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    loadDriverProfile();
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "test"));
      querySnapshot.forEach((doc) => {
        console.log("Test document data:", doc.data());
      });
      Alert.alert('Success', 'Firebase connection successful!');
    } catch (error) {
      console.error("Firebase connection error:", error);
      Alert.alert('Error', 'Failed to connect to Firebase');
    }
  };

  const loadDriverProfile = async () => {
    try {
      // TODO: Replace with actual driver ID from authentication
      const driverId = 'test-driver-id';
      const driverData = await driverService.getDriver(driverId);
      setDriver(driverData);
      setIsAvailable(driverData?.availability || false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      if (!driver?.id) return;
      
      const newAvailability = !isAvailable;
      await driverService.updateDriverAvailability(driver.id, newAvailability);
      setIsAvailable(newAvailability);
      
      Alert.alert(
        'Success',
        `You are now ${newAvailability ? 'available' : 'unavailable'} for trips.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    }
  };

  const createTestData = async () => {
    try {
      const result = await driverService.createTestDocuments();
      Alert.alert(
        'Success',
        `Test documents created successfully!\nTest Doc ID: ${result.testDocId}\nDriver Doc ID: ${result.driverDocId}`
      );
    } catch (error) {
      console.error('Error creating test data:', error);
      Alert.alert('Error', 'Failed to create test documents');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Welcome to Vahaka Partner</Text>
          <Text style={styles.subtitle}>
            Create your profile to start accepting trips
          </Text>
          <Button
            title="Create Profile"
            onPress={() => router.push('/create-profile')}
            style={styles.button}
          />
          <Button
            title="Create Test Data"
            onPress={createTestData}
            style={styles.button}
            variant="secondary"
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Profile Status</Text>
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            { color: driver.status === 'approved' ? COLORS.success : COLORS.warning }
          ]}>
            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Availability</Text>
        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityText}>
            {isAvailable ? 'Available for trips' : 'Not available for trips'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={handleAvailabilityToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Profile Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{driver.name}</Text>
          
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{driver.phone}</Text>
          
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{driver.email}</Text>
          
          <Text style={styles.infoLabel}>Experience</Text>
          <Text style={styles.infoValue}>{driver.experience} years</Text>
          
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>{driver.rating.toFixed(1)}</Text>
          
          <Text style={styles.infoLabel}>Total Trips</Text>
          <Text style={styles.infoValue}>{driver.totalTrips}</Text>
        </View>
      </Card>

      <Button
        title="Edit Profile"
        onPress={() => router.push('/edit-profile')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  infoContainer: {
    gap: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  button: {
    marginTop: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
}); 