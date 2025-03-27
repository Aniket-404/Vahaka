import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Mock booking details - in real app, this would come from API
  const [booking, setBooking] = useState({
    id: bookingId || '123456',
    driverName: 'John Doe',
    startDate: '2024-03-25',
    endDate: '2024-03-27',
    duration: 3,
    totalAmount: 5100,
    driverImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    tripType: 'Business',
    status: 'Confirmed',
    paymentMethod: 'VISA **** 4582'
  });
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Ionicons name="timer-outline" size={50} color="#4a90e2" />
        <ThemedText style={styles.loadingText}>Processing your booking...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.contentContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#4BB543" />
        </View>
        
        <ThemedText type="title" style={styles.successTitle}>Booking Confirmed!</ThemedText>
        <ThemedText style={styles.successMessage}>
          Your driver has been booked successfully. We've sent a confirmation to your email.
        </ThemedText>
        
        <ThemedView style={styles.bookingDetailsCard}>
          <ThemedText type="subtitle">Booking Details</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Booking ID</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{booking.id}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Driver</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{booking.driverName}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Trip Type</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{booking.tripType}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Start Date</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{formatDate(booking.startDate)}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>End Date</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{formatDate(booking.endDate)}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Duration</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{booking.duration} days</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Payment Method</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{booking.paymentMethod}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Status</ThemedText>
            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>{booking.status}</ThemedText>
            </View>
          </View>
          
          <View style={[styles.detailRow, styles.totalRow]}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.totalValue}>₹{booking.totalAmount}</ThemedText>
          </View>
        </ThemedView>
        
        <ThemedView style={styles.upcomingStepsCard}>
          <ThemedText type="subtitle">What's Next?</ThemedText>
          
          <View style={styles.stepRow}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="person-outline" size={24} color="#4a90e2" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText type="defaultSemiBold">Driver Contact</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Your driver will contact you 24 hours before the trip to confirm details.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepRow}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="car-outline" size={24} color="#4a90e2" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText type="defaultSemiBold">Driver Arrival</ThemedText>
              <ThemedText style={styles.stepDescription}>
                The driver will arrive at your location 15 minutes before the scheduled time.
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepRow}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="star-outline" size={24} color="#4a90e2" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText type="defaultSemiBold">Rate Your Trip</ThemedText>
              <ThemedText style={styles.stepDescription}>
                After the trip is completed, please share your feedback about the driver.
              </ThemedText>
            </View>
          </View>
        </ThemedView>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <ThemedText style={styles.primaryButtonText}>Back to Home</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/(tabs)/explore')}
          >
            <ThemedText style={styles.secondaryButtonText}>View Bookings</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.supportButton}>
          <Ionicons name="help-circle-outline" size={20} color="#4a90e2" />
          <ThemedText style={styles.supportButtonText}>Need Help?</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  bookingDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#e0f7e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#4a90e2',
  },
  upcomingStepsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: '#333',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  supportButtonText: {
    color: '#4a90e2',
    marginLeft: 8,
  },
}); 