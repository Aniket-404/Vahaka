import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Card, 
  Button, 
  Input,
  COLORS, 
  SPACING, 
  driverService 
} from '../../src';

export default function CreateProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    experience: '',
    about: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      plateNumber: '',
    },
    license: {
      number: '',
      expiryDate: '',
    },
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await driverService.createDriver({
        ...formData,
        experience: parseInt(formData.experience),
        availability: true,
      });
      Alert.alert(
        'Success',
        'Your profile has been submitted for review. We will notify you once it is approved.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof formData],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Full Name"
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
          placeholder="Enter your full name"
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Years of Experience"
          value={formData.experience}
          onChangeText={(value) => updateFormData('experience', value)}
          placeholder="Enter years of experience"
          keyboardType="numeric"
        />
        <Input
          label="About"
          value={formData.about}
          onChangeText={(value) => updateFormData('about', value)}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
        />
      </Card>

      <Card style={styles.card}>
        <Input
          label="Vehicle Make"
          value={formData.vehicle.make}
          onChangeText={(value) => updateFormData('vehicle.make', value)}
          placeholder="Enter vehicle make"
        />
        <Input
          label="Vehicle Model"
          value={formData.vehicle.model}
          onChangeText={(value) => updateFormData('vehicle.model', value)}
          placeholder="Enter vehicle model"
        />
        <Input
          label="Vehicle Year"
          value={formData.vehicle.year}
          onChangeText={(value) => updateFormData('vehicle.year', value)}
          placeholder="Enter vehicle year"
          keyboardType="numeric"
        />
        <Input
          label="Vehicle Color"
          value={formData.vehicle.color}
          onChangeText={(value) => updateFormData('vehicle.color', value)}
          placeholder="Enter vehicle color"
        />
        <Input
          label="License Plate Number"
          value={formData.vehicle.plateNumber}
          onChangeText={(value) => updateFormData('vehicle.plateNumber', value)}
          placeholder="Enter license plate number"
        />
      </Card>

      <Card style={styles.card}>
        <Input
          label="Driver's License Number"
          value={formData.license.number}
          onChangeText={(value) => updateFormData('license.number', value)}
          placeholder="Enter driver's license number"
        />
        <Input
          label="License Expiry Date"
          value={formData.license.expiryDate}
          onChangeText={(value) => updateFormData('license.expiryDate', value)}
          placeholder="Enter license expiry date (YYYY-MM-DD)"
        />
      </Card>

      <Button
        title="Submit Profile"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    margin: SPACING.md,
  },
  submitButton: {
    margin: SPACING.md,
  },
}); 