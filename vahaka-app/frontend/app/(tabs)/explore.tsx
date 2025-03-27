import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';

const BOOKING_HISTORY = [
  {
    id: '1',
    driverName: 'John Doe',
    date: '15 Mar 2024',
    tripType: 'Business',
    status: 'Completed',
    amount: 3600,
  },
  {
    id: '2',
    driverName: 'Sarah Smith',
    date: '28 Feb 2024',
    tripType: 'Weekly',
    status: 'Completed',
    amount: 7500,
  },
  {
    id: '3',
    driverName: 'Mike Johnson',
    date: '10 Feb 2024',
    tripType: 'Urgent',
    status: 'Cancelled',
    amount: 1100,
  },
];

export default function ProfileScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#4a90e2', dark: '#2a5b99' }}
      headerImage={
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/22.jpg' }}
            style={styles.profileImage}
          />
        </View>
      }>
      <ThemedView style={styles.profileContainer}>
        <ThemedText type="title">Alex Johnson</ThemedText>
        <ThemedText style={styles.email}>alex.johnson@example.com</ThemedText>
        
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#4a90e2" />
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>12</ThemedText>
          <ThemedText style={styles.statLabel}>Bookings</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>8</ThemedText>
          <ThemedText style={styles.statLabel}>Drivers</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>4.9</ThemedText>
          <ThemedText style={styles.statLabel}>Rating</ThemedText>
        </View>
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Booking History</ThemedText>
        {BOOKING_HISTORY.map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.bookingItem}>
            <View style={styles.bookingHeader}>
              <ThemedText type="defaultSemiBold">{booking.driverName}</ThemedText>
              <ThemedText 
                style={[
                  styles.bookingStatus, 
                  booking.status === 'Completed' ? styles.statusCompleted : styles.statusCancelled
                ]}
              >
                {booking.status}
              </ThemedText>
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.bookingDetail}>
                <Ionicons name="calendar-outline" size={14} color="#888" />
                <ThemedText style={styles.bookingDetailText}>{booking.date}</ThemedText>
              </View>
              <View style={styles.bookingDetail}>
                <Ionicons name="car-outline" size={14} color="#888" />
                <ThemedText style={styles.bookingDetailText}>{booking.tripType}</ThemedText>
              </View>
            </View>
            <View style={styles.bookingFooter}>
              <ThemedText type="defaultSemiBold" style={styles.bookingAmount}>
                ₹{booking.amount}
              </ThemedText>
              <TouchableOpacity style={styles.bookingActionButton}>
                <ThemedText style={styles.bookingActionText}>View Details</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ThemedView>
      
      <Collapsible title="Payment Methods">
        <TouchableOpacity style={styles.paymentMethodItem}>
          <Ionicons name="card-outline" size={24} color="#333" />
          <View style={styles.paymentMethodInfo}>
            <ThemedText type="defaultSemiBold">VISA **** 4582</ThemedText>
            <ThemedText style={styles.paymentMethodExpiry}>Expires 09/25</ThemedText>
          </View>
          <Ionicons name="checkmark-circle" size={20} color="#4a90e2" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.paymentMethodItem}>
          <Ionicons name="wallet-outline" size={24} color="#333" />
          <View style={styles.paymentMethodInfo}>
            <ThemedText type="defaultSemiBold">UPI - example@upi</ThemedText>
            <ThemedText style={styles.paymentMethodExpiry}>Default payment method</ThemedText>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addPaymentButton}>
          <Ionicons name="add-circle-outline" size={20} color="#4a90e2" />
          <ThemedText style={styles.addPaymentText}>Add Payment Method</ThemedText>
        </TouchableOpacity>
      </Collapsible>
      
      <Collapsible title="Settings">
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
          <ThemedText style={styles.settingsText}>Notifications</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#888" style={styles.settingsArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#333" />
          <ThemedText style={styles.settingsText}>Privacy & Security</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#888" style={styles.settingsArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="help-circle-outline" size={20} color="#333" />
          <ThemedText style={styles.settingsText}>Help & Support</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#888" style={styles.settingsArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  email: {
    color: '#888',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#e0f0ff',
  },
  editButtonText: {
    color: '#4a90e2',
    fontSize: 14,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusCompleted: {
    backgroundColor: '#e0f7e0',
    color: '#2e7d32',
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  bookingDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  bookingDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  bookingAmount: {
    fontSize: 16,
    color: '#4a90e2',
  },
  bookingActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  bookingActionText: {
    fontSize: 12,
    color: '#555',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodExpiry: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addPaymentText: {
    color: '#4a90e2',
    marginLeft: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsText: {
    flex: 1,
    marginLeft: 12,
  },
  settingsArrow: {
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#ff3b30',
    marginLeft: 12,
  },
});
