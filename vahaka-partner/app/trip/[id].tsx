import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { tripService } from '../../services';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Trip } from '../../models/Trip';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    if (!id) return;
    
    try {
      const tripData = await tripService.getTrip(id.toString());
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip data:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: Trip['status']) => {
    if (!trip) return;
    
    setIsUpdating(true);
    try {
      await tripService.updateTripStatus(trip.id, status);
      
      // If trip is completed, update additional details
      if (status === 'completed') {
        await tripService.completeTrip(
          trip.id,
          trip.fare,
          trip.distance,
          trip.duration
        );
      }
      
      // Reload trip data to show updated status
      await loadTripData();
      
      Alert.alert('Success', `Trip status updated to ${status}`);
    } catch (error) {
      console.error('Error updating trip status:', error);
      Alert.alert('Error', 'Failed to update trip status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Trip not found or unavailable.</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          style={styles.button}
        />
      </View>
    );
  }

  const renderActionButtons = () => {
    switch (trip.status) {
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <Button 
              title="Accept Trip" 
              onPress={() => handleUpdateStatus('accepted')}
              loading={isUpdating}
              style={styles.actionButton}
              variant="primary"
              fullWidth
            />
            <Button 
              title="Decline Trip" 
              onPress={() => handleUpdateStatus('cancelled')}
              loading={isUpdating}
              style={styles.actionButton}
              variant="outline"
              fullWidth
            />
          </View>
        );
      case 'accepted':
        return (
          <View style={styles.actionButtons}>
            <Button 
              title="Start Trip" 
              onPress={() => handleUpdateStatus('started')}
              loading={isUpdating}
              style={styles.actionButton}
              variant="primary"
              fullWidth
            />
            <Button 
              title="Cancel Trip" 
              onPress={() => handleUpdateStatus('cancelled')}
              loading={isUpdating}
              style={styles.actionButton}
              variant="error"
              fullWidth
            />
          </View>
        );
      case 'started':
        return (
          <Button 
            title="Complete Trip" 
            onPress={() => handleUpdateStatus('completed')}
            loading={isUpdating}
            style={styles.actionButton}
            variant="success"
            fullWidth
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: `Trip #${trip.id.substring(0, 6).toUpperCase()}`,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, getStatusStyle(trip.status)]}>
              <Text style={styles.statusText}>{trip.status}</Text>
            </View>
            <Text style={styles.tripDate}>
              {formatDate(trip.timestamps.requested)} at {formatTime(trip.timestamps.requested)}
            </Text>
          </View>

          {renderActionButtons()}
        </Card>

        {/* Trip Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Trip Details</Text>
          
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <View style={styles.locationDot} />
              <Text style={styles.locationLabel}>Pickup</Text>
            </View>
            <Text style={styles.locationAddress}>{trip.pickup.address}</Text>
            <Text style={styles.locationTime}>
              {trip.timestamps.accepted 
                ? `${formatDate(trip.timestamps.accepted)} at ${formatTime(trip.timestamps.accepted)}`
                : 'Not yet accepted'}
            </Text>
          </View>
          
          <View style={styles.connector} />
          
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <Text style={styles.locationLabel}>Dropoff</Text>
            </View>
            <Text style={styles.locationAddress}>{trip.dropoff.address}</Text>
            <Text style={styles.locationTime}>
              {trip.timestamps.completed 
                ? `${formatDate(trip.timestamps.completed)} at ${formatTime(trip.timestamps.completed)}`
                : 'Not completed yet'}
            </Text>
          </View>
        </Card>

        {/* Trip Stats Card */}
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Trip Statistics</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{trip.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{trip.duration} min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>${trip.fare.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Fare</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{trip.paymentMethod}</Text>
              <Text style={styles.statLabel}>Payment Method</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{trip.paymentStatus}</Text>
              <Text style={styles.statLabel}>Payment Status</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{trip.vehicleType}</Text>
              <Text style={styles.statLabel}>Vehicle Type</Text>
            </View>
          </View>
        </Card>

        {/* Customer Info - In a real app, you'd fetch customer details */}
        <Card style={styles.customerCard}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customerContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>C</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>Customer</Text>
              <Text style={styles.customerId}>ID: {trip.customerId.substring(0, 8)}</Text>
            </View>
          </View>
        </Card>

        {/* Trip timestamps */}
        {trip.status !== 'pending' && (
          <Card style={styles.timelineCard}>
            <Text style={styles.cardTitle}>Trip Timeline</Text>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Trip Requested</Text>
                <Text style={styles.timelineTime}>
                  {formatDate(trip.timestamps.requested)} at {formatTime(trip.timestamps.requested)}
                </Text>
              </View>
            </View>
            
            {trip.timestamps.accepted && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Trip Accepted</Text>
                  <Text style={styles.timelineTime}>
                    {formatDate(trip.timestamps.accepted)} at {formatTime(trip.timestamps.accepted)}
                  </Text>
                </View>
              </View>
            )}
            
            {trip.timestamps.started && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Trip Started</Text>
                  <Text style={styles.timelineTime}>
                    {formatDate(trip.timestamps.started)} at {formatTime(trip.timestamps.started)}
                  </Text>
                </View>
              </View>
            )}
            
            {trip.timestamps.completed && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.completedDot]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Trip Completed</Text>
                  <Text style={styles.timelineTime}>
                    {formatDate(trip.timestamps.completed)} at {formatTime(trip.timestamps.completed)}
                  </Text>
                </View>
              </View>
            )}
            
            {trip.timestamps.cancelled && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.cancelledDot]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Trip Cancelled</Text>
                  <Text style={styles.timelineTime}>
                    {formatDate(trip.timestamps.cancelled)} at {formatTime(trip.timestamps.cancelled)}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </>
  );
}

const getStatusStyle = (status: Trip['status']) => {
  switch (status) {
    case 'completed': return { backgroundColor: COLORS.success };
    case 'cancelled': return { backgroundColor: COLORS.error };
    case 'pending': return { backgroundColor: COLORS.warning };
    case 'accepted': return { backgroundColor: COLORS.primary };
    case 'started': return { backgroundColor: COLORS.secondary };
    default: return { backgroundColor: COLORS.textSecondary };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  button: {
    minWidth: 150,
  },
  statusCard: {
    marginBottom: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.surface,
    textTransform: 'capitalize',
  },
  tripDate: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    gap: SPACING.sm,
  },
  actionButton: {
    marginBottom: SPACING.xs,
  },
  detailsCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  locationContainer: {
    marginBottom: SPACING.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.xs,
  },
  destinationDot: {
    backgroundColor: COLORS.error,
  },
  locationLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  locationAddress: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 4,
    paddingLeft: SPACING.lg,
  },
  locationTime: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    paddingLeft: SPACING.lg,
  },
  connector: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.border,
    marginLeft: 6,
    marginBottom: SPACING.sm,
  },
  statsCard: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  customerCard: {
    marginBottom: SPACING.md,
  },
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  customerId: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  timelineCard: {
    marginBottom: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
    marginTop: 4,
  },
  completedDot: {
    backgroundColor: COLORS.success,
  },
  cancelledDot: {
    backgroundColor: COLORS.error,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
}); 