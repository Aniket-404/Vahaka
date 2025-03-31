import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { useAuth } from './context/auth';
import bookingService, { getUpcomingUserBookings, getPastUserBookings, cancelBooking } from './services/bookingService';

// Booking type definition
interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverDetails: {
    name: string;
    phone: string;
    vehicle: string | { 
      make?: string; 
      model?: string; 
      color?: string;
      plateNumber?: string;
      year?: string;
    };
  };
  paymentStatus: 'paid' | 'unpaid';
}

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBookings = async (isRefresh = false) => {
    if (!user) {
      setError('Please log in to view your bookings');
      setIsLoading(false);
      return;
    }
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      let fetchedBookings;
      
      if (activeTab === 'upcoming') {
        fetchedBookings = await getUpcomingUserBookings(user.uid);
      } else {
        fetchedBookings = await getPastUserBookings(user.uid);
      }
      
      setBookings(fetchedBookings);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchBookings();
  }, [user, activeTab]);
  
  const handleRefresh = () => {
    fetchBookings(true);
  };
  
  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId, 'User cancelled');
              // Refresh bookings after cancellation
              fetchBookings();
              Alert.alert('Success', 'Your booking has been cancelled');
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const renderTabButton = (tabName: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabName && styles.activeTabButton]}
      onPress={() => setActiveTab(tabName)}
    >
      <Ionicons 
        name={icon as any} 
        size={18} 
        color={activeTab === tabName ? '#2563EB' : '#64748B'} 
      />
      <ThemedText style={[
        styles.tabButtonText, 
        activeTab === tabName && styles.activeTabButtonText
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981'; // Green
      case 'pending':
        return '#F59E0B'; // Amber
      case 'completed':
        return '#2563EB'; // Blue
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#64748B'; // Gray
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'completed':
        return 'flag-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };
  
  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => router.push(`/booking-details?id=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.driverInfo}>
          <ThemedText style={styles.driverName}>{item.driverDetails.name}</ThemedText>
          <ThemedText style={styles.vehicleName}>
            {typeof item.driverDetails.vehicle === 'object' 
              ? `${item.driverDetails.vehicle.make || ''} ${item.driverDetails.vehicle.model || ''} ${item.driverDetails.vehicle.color || ''}`.trim()
              : item.driverDetails.vehicle}
          </ThemedText>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <ThemedText style={styles.detailText}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </ThemedText>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <ThemedText style={styles.detailText}>
            {item.duration} {item.duration === 1 ? 'day' : 'days'}
          </ThemedText>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="wallet-outline" size={16} color="#64748B" />
          <ThemedText style={styles.detailText}>
            ₹{item.totalAmount} • {item.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </ThemedText>
        </View>
      </View>
      
      {activeTab === 'upcoming' && item.status !== 'cancelled' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => router.push(`/booking-details?id=${item.id}`)}
          >
            <ThemedText style={styles.viewButtonText}>View Details</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(item.id)}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'past' && item.status === 'completed' && !item.rating && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={() => router.push(`/add-review?bookingId=${item.id}`)}
          >
            <ThemedText style={styles.reviewButtonText}>Add Review</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      {error ? (
        <>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.emptyStateText}>{error}</ThemedText>
        </>
      ) : (
        <>
          <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
          <ThemedText style={styles.emptyStateText}>
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming bookings"
              : "You don't have any past bookings"}
          </ThemedText>
          {activeTab === 'upcoming' && (
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => router.push('/')}
            >
              <ThemedText style={styles.bookButtonText}>Book a Driver</ThemedText>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Bookings</ThemedText>
      </View>
      
      <View style={styles.tabContainer}>
        {renderTabButton('upcoming', 'Upcoming', 'calendar-outline')}
        {renderTabButton('past', 'Past', 'time-outline')}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={styles.loadingText}>Loading bookings...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  activeTabButton: {
    backgroundColor: '#EFF6FF',
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleName: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    marginRight: 10,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
  },
  reviewButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  bookButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
}); 