import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../../components/Themed';
import { useAuth } from '../context/auth';
import { getUserBookings } from '../services/userService';
import { Booking } from '../types/user';

const BookingHistoryScreen = () => {
  const { userData } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const userBookings = await getUserBookings();
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | any) => {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981'; // Green
      case 'completed':
        return '#2563EB'; // Blue
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#94A3B8'; // Gray
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.driverInfo}>
          <Image
            source={{ uri: item.driverImage }}
            style={styles.driverImage}
          />
          <View>
            <ThemedText style={styles.driverName}>{item.driverName}</ThemedText>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <ThemedText style={styles.dateText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </ThemedText>
            </View>
          </View>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}
        >
          <ThemedText 
            style={[
              styles.statusText, 
              { color: getStatusColor(item.status) }
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Location</ThemedText>
          <ThemedText style={styles.detailValue}>{item.location}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Trip Type</ThemedText>
          <ThemedText style={styles.detailValue}>{item.tripType}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Payment</ThemedText>
          <ThemedText style={styles.detailValue}>{item.paymentMethod} • {item.paymentStatus}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Amount</ThemedText>
          <ThemedText style={styles.amountText}>₹{item.totalAmount}</ThemedText>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#94A3B8" />
      <ThemedText style={styles.emptyTitle}>No bookings yet</ThemedText>
      <ThemedText style={styles.emptyText}>
        Your booking history will appear here once you book a driver.
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={styles.loadingText}>Loading bookings...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadBookings}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BookingHistoryScreen; 