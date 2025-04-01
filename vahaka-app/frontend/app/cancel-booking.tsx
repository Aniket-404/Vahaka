import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import { cancelBooking, getBooking } from '@/app/services/bookingService';
import { Booking } from '@/app/types/user';

export default function CancelBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) {
      setError('Booking ID is required');
      setIsLoading(false);
      return;
    }
    
    fetchBookingDetails();
  }, [id]);
  
  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const bookingData = await getBooking(id as string);
      
      if (!bookingData) {
        setError('Booking not found');
      } else {
        console.log('Booking data:', bookingData);
        setBooking(bookingData);
      }
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setError(error.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelBooking = async () => {
    if (!booking || !id) return;
    
    try {
      setIsCancelling(true);
      await cancelBooking(id as string, 'Cancelled by user from app');
      Alert.alert(
        'Booking Cancelled',
        'Your booking has been successfully cancelled.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(tabs)/bookings')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      Alert.alert(
        'Cancellation Failed',
        error.message || 'Failed to cancel booking. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCancelling(false);
    }
  };
  
  const confirmCancellation = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: handleCancelBooking }
      ]
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Cancel Booking</ThemedText>
        </View>
      </LinearGradient>
      
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <ThemedText style={styles.loadingText}>Loading booking details...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
            <ThemedText style={styles.errorTitle}>Error</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity 
              style={styles.backToBookingsButton}
              onPress={() => router.replace('/(tabs)/bookings')}
            >
              <ThemedText style={styles.backToBookingsText}>Back to Bookings</ThemedText>
            </TouchableOpacity>
          </View>
        ) : booking ? (
          <View style={styles.bookingContainer}>
            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={40} color="#EF4444" />
              <ThemedText style={styles.warningTitle}>Cancel This Booking?</ThemedText>
              <ThemedText style={styles.warningText}>
                You are about to cancel your booking with{' '}
                <ThemedText style={styles.driverNameText}>
                  {booking.driverName || booking.driverDetails?.name || 'this driver'}
                </ThemedText>
                {booking.driverDetails?.vehicle && typeof booking.driverDetails.vehicle === 'string' && (
                  <>
                    {' '}who drives a{' '}
                    <ThemedText style={styles.vehicleText}>{booking.driverDetails.vehicle}</ThemedText>
                  </>
                )}
                {booking.driverDetails?.vehicle && typeof booking.driverDetails.vehicle === 'object' && (
                  <>
                    {' '}who drives a{' '}
                    <ThemedText style={styles.vehicleText}>
                      {[
                        booking.driverDetails.vehicle.color,
                        booking.driverDetails.vehicle.make,
                        booking.driverDetails.vehicle.model
                      ].filter(Boolean).join(' ')}
                    </ThemedText>
                  </>
                )}
                . This action cannot be undone.
              </ThemedText>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Booking ID:</ThemedText>
                <ThemedText style={styles.infoValue}>{booking.id}</ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Driver:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {booking.driverName || booking.driverDetails?.name || 'Driver information unavailable'}
                </ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Date:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {booking.startDate && new Date(booking.startDate).toString() !== 'Invalid Date' 
                    ? new Date(booking.startDate).toLocaleDateString() 
                    : 'Start date unavailable'} - 
                  {booking.endDate && new Date(booking.endDate).toString() !== 'Invalid Date'
                    ? new Date(booking.endDate).toLocaleDateString()
                    : 'End date unavailable'}
                </ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Status:</ThemedText>
                <ThemedText style={styles.infoValue}>{booking.status}</ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Amount:</ThemedText>
                <ThemedText style={styles.infoValue}>₹{booking.totalAmount?.toFixed(2) || '0.00'}</ThemedText>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.keepBookingButton}
                onPress={() => router.back()}
              >
                <ThemedText style={styles.keepBookingText}>Keep Booking</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelBookingButton}
                onPress={confirmCancellation}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={styles.cancelIcon} />
                    <ThemedText style={styles.cancelBookingText}>Cancel Booking</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
            <ThemedText style={styles.errorTitle}>No Booking Found</ThemedText>
            <TouchableOpacity 
              style={styles.backToBookingsButton}
              onPress={() => router.replace('/(tabs)/bookings')}
            >
              <ThemedText style={styles.backToBookingsText}>Back to Bookings</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToBookingsButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToBookingsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  bookingContainer: {
    flex: 1,
  },
  warningContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    marginBottom: 24,
  },
  keepBookingButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  keepBookingText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelBookingButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelIcon: {
    marginRight: 8,
  },
  cancelBookingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  driverNameText: {
    fontWeight: '700',
    color: '#991B1B',
  },
  vehicleText: {
    fontWeight: '600',
    color: '#991B1B',
  },
}); 