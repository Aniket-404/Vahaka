import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import driverService from './services/driverService';
import { createBooking } from './services/bookingService';
import { useAuth } from './context/auth';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { driverId, startDate, endDate } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Calculate dates and durations
  const parsedStartDate = startDate ? new Date(String(startDate)) : new Date();
  const parsedEndDate = endDate ? new Date(String(endDate)) : new Date();
  
  const tripDuration = Math.ceil(
    (parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  
  useEffect(() => {
    const loadDriverData = async () => {
      if (!driverId) {
        setError('Driver ID is required');
        setIsLoading(false);
        return;
      }
      
      try {
        const driverData = await driverService.getDriverById(String(driverId));
        setDriver(driverData);
      } catch (error) {
        console.error('Error fetching driver details:', error);
        setError('Failed to load driver details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDriverData();
  }, [driverId]);
  
  // Calculate price
  const calculatePrices = () => {
    if (!driver) return { driverRate: 0, allowance: 0, total: 0 };
    
    const driverRate = driver.price * tripDuration;
    const allowance = 500 * tripDuration; // Daily allowance
    const total = driverRate + allowance;
    
    return { driverRate, allowance, total };
  };
  
  const { driverRate, allowance, total } = calculatePrices();
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert(
        "Login Required", 
        "Please login to confirm your booking.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/auth/login") }
        ]
      );
      return;
    }
    
    setIsBooking(true);
    
    try {
      const bookingData = {
        userId: user.uid,
        driverId: String(driverId),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        duration: tripDuration,
        totalAmount: total,
        status: 'pending',
        createdAt: new Date(),
        driverDetails: {
          name: driver.name,
          phone: driver.phoneNumber,
          vehicle: driver.vehicle
        },
        paymentStatus: 'unpaid'
      };
      
      await createBooking(bookingData);
      setBookingSuccess(true);
      
      // Wait a moment before navigating
      setTimeout(() => {
        router.push('/(tabs)/bookings');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(
        "Booking Failed", 
        "There was an error processing your booking. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={styles.loadingText}>Loading booking details...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error || !driver) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error || 'Driver not found'}</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  if (bookingSuccess) {
  return (
      <ThemedView style={styles.successContainer}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={64} color="white" />
        </View>
        <ThemedText style={styles.successTitle}>Booking Confirmed!</ThemedText>
        <ThemedText style={styles.successMessage}>
          Your driver has been booked successfully. You'll receive a confirmation shortly.
        </ThemedText>
        <ThemedText style={styles.redirectingText}>
          Redirecting to your bookings...
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon} 
          onPress={() => router.back()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Booking Confirmation</ThemedText>
        
        <View style={styles.emptySpace} />
          </View>
          
      {/* Booking Summary Card */}
      <View style={styles.card}>
        <View style={styles.bookingHeader}>
          <ThemedText style={styles.bookingTitle}>Booking Details</ThemedText>
          </View>
          
        {/* Driver Info */}
        <View style={styles.driverInfoSection}>
          <Image source={{ uri: driver.image }} style={styles.driverImage} />
          
          <View style={styles.driverDetails}>
            <ThemedText style={styles.driverName}>{driver.name}</ThemedText>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.ratingText}>
                {driver.rating.toFixed(1)} • {driver.trips} trips
              </ThemedText>
          </View>
          
            <ThemedText style={styles.vehicleText}>
              {typeof driver.vehicle === 'object' 
                ? `${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.color})`
                : driver.vehicle}
            </ThemedText>
          </View>
          </View>
          
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Booking Dates */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="calendar-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.detailTextContainer}>
              <ThemedText style={styles.detailLabel}>Trip Dates</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatDate(parsedStartDate)} - {formatDate(parsedEndDate)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="time-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.detailTextContainer}>
              <ThemedText style={styles.detailLabel}>Duration</ThemedText>
              <ThemedText style={styles.detailValue}>
                {tripDuration} {tripDuration === 1 ? 'Day' : 'Days'}
              </ThemedText>
            </View>
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <ThemedText style={styles.priceSectionTitle}>Price Breakdown</ThemedText>
          
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>
              Driver Rate ({tripDuration} {tripDuration === 1 ? 'day' : 'days'})
            </ThemedText>
            <ThemedText style={styles.priceValue}>₹{driverRate}</ThemedText>
            </View>
          
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>
              Daily Allowance ({tripDuration} {tripDuration === 1 ? 'day' : 'days'})
              </ThemedText>
            <ThemedText style={styles.priceValue}>₹{allowance}</ThemedText>
          </View>
          
          {/* Divider for total */}
          <View style={styles.priceDivider} />
          
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.totalValue}>₹{total}</ThemedText>
          </View>
        </View>
      </View>
      
      {/* Payment Notice */}
      <View style={styles.paymentNotice}>
        <Ionicons name="information-circle-outline" size={20} color="#4a70ae" />
        <ThemedText style={styles.paymentNoticeText}>
          Payment will be collected by the driver upon arrival
        </ThemedText>
      </View>
      
      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <TouchableOpacity style={styles.termsButton}>
          <ThemedText style={styles.termsButtonText}>
            View Terms & Conditions
          </ThemedText>
          </TouchableOpacity>
        </View>
        
      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={isBooking}
        >
          {isBooking ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>Confirm Booking</ThemedText>
          )}
        </TouchableOpacity>
      </View>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#10B981',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#334155',
    lineHeight: 24,
  },
  redirectingText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySpace: {
    width: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  bookingHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  driverInfoSection: {
    flexDirection: 'row',
    padding: 16,
  },
  driverImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748B',
  },
  vehicleText: {
    fontSize: 14,
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  detailsSection: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  priceSection: {
    padding: 16,
  },
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#334155',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  paymentNoticeText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  termsButton: {
    padding: 8,
  },
  termsButtonText: {
    fontSize: 14,
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 