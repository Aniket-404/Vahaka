import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, StatusBar, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ThemedText from '../components/ThemedText';
import ThemedView from '../components/ThemedView';
import { Booking } from './types/user';
import { getBookingById, cancelBooking } from './services/userService';

export default function BookingDetailsScreen() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!id) {
          setError('Booking ID not provided');
          setIsLoading(false);
          return;
        }
        
        const bookingData = await getBookingById(id as string);
        setBooking(bookingData);
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        setError(error.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [id]);
  
  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await cancelBooking(id as string);
              
              // Update the local booking data
              if (booking) {
                setBooking({
                  ...booking,
                  status: 'Cancelled'
                });
              }
              
              Alert.alert(
                'Booking Cancelled',
                'Your booking has been successfully cancelled.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to cancel booking. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };
  
  const getStatusColor = (status: string): { background: string; text: string } => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { background: '#DCFCE7', text: '#16A34A' };
      case 'cancelled':
        return { background: '#FEE2E2', text: '#DC2626' };
      case 'completed':
        return { background: '#E0F2FE', text: '#0284C7' };
      case 'pending':
        return { background: '#FEF3C7', text: '#D97706' };
      default:
        return { background: '#F3F4F6', text: '#4B5563' };
    }
  };
  
  const getPaymentStatusColor = (status: string): { background: string; text: string } => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { background: '#DCFCE7', text: '#16A34A' };
      case 'pending':
        return { background: '#FEF3C7', text: '#D97706' };
      case 'failed':
        return { background: '#FEE2E2', text: '#DC2626' };
      default:
        return { background: '#F3F4F6', text: '#4B5563' };
    }
  };
  
  // Format dates helper with improved error handling
  const formatDate = (dateInput: any) => {
    try {
      if (!dateInput) return 'Date not available';
      
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Date error';
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
  
  if (error || !booking) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <ThemedText style={styles.errorTitle}>Error Loading Booking</ThemedText>
        <ThemedText style={styles.errorText}>{error || 'Booking not found'}</ThemedText>
        <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
          <ThemedText style={styles.errorBackButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  const statusStyle = getStatusColor(booking.status);
  const paymentStatusStyle = getPaymentStatusColor(booking.paymentStatus);

  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Booking Details</ThemedText>
        
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Header Card */}
        <View style={styles.bookingCard}>
          <View style={styles.idAndStatusContainer}>
            <View style={styles.bookingIdContainer}>
              <ThemedText style={styles.bookingIdLabel}>Booking ID</ThemedText>
              <ThemedText style={styles.bookingIdValue}>{booking.id}</ThemedText>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
              <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                {booking.status}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <ThemedText style={styles.dateLabel}>Booking Date:</ThemedText>
            <ThemedText style={styles.dateValue}>
              {formatDate(booking.createdAt)}
            </ThemedText>
          </View>
        </View>
        
        {/* Driver Details Card */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Driver Details</ThemedText>
          
          <View style={styles.driverInfoContainer}>
            <View style={styles.driverImageContainer}>
              {booking.driverImage ? (
                <Image source={{ uri: booking.driverImage }} style={styles.driverImage} />
              ) : (
                <View style={styles.driverImagePlaceholder}>
                  <Ionicons name="person" size={30} color="#2563EB" />
                </View>
              )}
            </View>
            
            <View style={styles.driverDetails}>
              <ThemedText style={styles.driverName}>
                {booking.driverName || booking.driverDetails?.name || 'Driver Name Not Available'}
              </ThemedText>
              
              {booking.driverDetails?.phone && (
                <ThemedText style={styles.driverPhone}>
                  <Ionicons name="call-outline" size={14} color="#64748B" />
                  {' '}{booking.driverDetails.phone}
                </ThemedText>
              )}
              
              <TouchableOpacity 
                style={styles.viewDriverButton}
                onPress={() => router.push(`/driver-details?id=${booking.driverId}`)}
              >
                <ThemedText style={styles.viewDriverText}>View Driver</ThemedText>
                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
          
          {booking.driverDetails?.vehicle && (
            <>
              <View style={styles.divider} />
              <View style={styles.vehicleContainer}>
                <Ionicons name="car-outline" size={20} color="#64748B" />
                <View style={styles.vehicleDetails}>
                  <ThemedText style={styles.vehicleLabel}>Vehicle</ThemedText>
                  <ThemedText style={styles.vehicleValue}>
                    {typeof booking.driverDetails.vehicle === 'string' 
                      ? booking.driverDetails.vehicle 
                      : [
                          booking.driverDetails.vehicle.make,
                          booking.driverDetails.vehicle.model,
                          booking.driverDetails.vehicle.color
                        ].filter(Boolean).join(' ') || 'Vehicle details not available'
                    }
                  </ThemedText>
                  
                  {typeof booking.driverDetails.vehicle !== 'string' && booking.driverDetails.vehicle.plateNumber && (
                    <ThemedText style={styles.licensePlate}>
                      Plate: {booking.driverDetails.vehicle.plateNumber}
                    </ThemedText>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
        
        {/* Trip Details Card */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Trip Details</ThemedText>
          
          <View style={styles.detailItemRow}>
            <Ionicons name="time-outline" size={20} color="#64748B" />
            <View style={styles.detailItemContent}>
              <ThemedText style={styles.detailItemLabel}>Duration</ThemedText>
              <ThemedText style={styles.detailItemValue}>
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailItemRow}>
            <Ionicons name="location-outline" size={20} color="#64748B" />
            <View style={styles.detailItemContent}>
              <ThemedText style={styles.detailItemLabel}>Location</ThemedText>
              <ThemedText style={styles.detailItemValue}>
                {booking.location || 'Not specified'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailItemRow}>
            <Ionicons name="car-outline" size={20} color="#64748B" />
            <View style={styles.detailItemContent}>
              <ThemedText style={styles.detailItemLabel}>Trip Type</ThemedText>
              <ThemedText style={styles.detailItemValue}>
                {booking.tripType || 'Standard'}
              </ThemedText>
            </View>
          </View>
        </View>
        
        {/* Payment Details Card */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Payment Details</ThemedText>
          
          <View style={styles.detailItemRow}>
            <Ionicons name="card-outline" size={20} color="#64748B" />
            <View style={styles.detailItemContent}>
              <ThemedText style={styles.detailItemLabel}>Payment Method</ThemedText>
              <ThemedText style={styles.detailItemValue}>
                {booking.paymentMethod || 'Not specified'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailItemRow}>
            <Ionicons name="cash-outline" size={20} color="#64748B" />
            <View style={styles.detailItemContent}>
              <ThemedText style={styles.detailItemLabel}>Total Amount</ThemedText>
              <ThemedText style={styles.detailItemValue}>
                ₹{booking.totalAmount?.toFixed(2) || '0.00'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailItemRow}>
            <Ionicons 
              name={booking.paymentStatus.toLowerCase() === 'paid' ? "checkmark-circle-outline" : "timer-outline"} 
              size={20} 
              color={paymentStatusStyle.text}
            />
            <View style={styles.detailItemContent}>
              <ThemedText style={styles.detailItemLabel}>Payment Status</ThemedText>
              <View style={[styles.paymentStatusBadge, { backgroundColor: paymentStatusStyle.background }]}>
                <ThemedText style={[styles.paymentStatusText, { color: paymentStatusStyle.text }]}>
                  {booking.paymentStatus}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Action Buttons - Fixed at bottom */}
      {(booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'pending') && (
        <View style={styles.bottomActionBar}>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/support')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2563EB" />
            <ThemedText style={styles.supportButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelBooking}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.cancelButtonText}>Cancel Booking</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '98%',
    maxWidth: 360,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  idAndStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingIdContainer: {
    flexDirection: 'column',
  },
  bookingIdLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 12,
    color: '#1E293B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '98%',
    maxWidth: 360,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1E293B',
  },
  driverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverImage: {
    width: 60,
    height: 60,
  },
  driverImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  viewDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDriverText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
    marginRight: 4,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailItemLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  detailItemValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  paymentStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    width: '98%',
    maxWidth: 360,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginLeft: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
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
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 300,
  },
  errorBackButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  errorBackButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  driverPhone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
  },
  vehicleDetails: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  vehicleValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  licensePlate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});