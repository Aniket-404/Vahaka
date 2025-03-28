import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS } from '../../constants/theme';
import { authService, driverService, tripService } from '../../services';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Driver } from '../../models/Driver';
import { Trip } from '../../models/Trip';

export default function HomeScreen() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadDriverData = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        // Not logged in, redirect to login
        router.replace('/auth/login');
        return;
      }

      const driverData = await driverService.getDriver(user.uid);
      if (driverData) {
        setDriver(driverData);
        setIsOnline(driverData.availability);
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
      Alert.alert('Error', 'Failed to load your profile data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const checkCurrentTrip = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      // Use the unsubscribe function if needed to clean up
      return tripService.watchDriverActiveTrip(user.uid, (trip) => {
        setCurrentTrip(trip);
      });
    } catch (error) {
      console.error('Error checking current trip:', error);
    }
  };

  useEffect(() => {
    loadDriverData();
    const unsubscribe = checkCurrentTrip();
    
    // Clean up the subscription
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleToggleAvailability = async () => {
    if (!driver) return;
    
    try {
      await driverService.updateDriverAvailability(driver.id, !isOnline);
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update your availability status');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDriverData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'rejected': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header with availability toggle */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {driver?.name?.split(' ')[0] || 'Driver'}
        </Text>
        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityLabel}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: COLORS.disabled, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>
      </View>

      {/* Current Trip Card */}
      {currentTrip && (
        <TouchableOpacity 
          onPress={() => router.push(`/trip/${currentTrip.id}`)}
          activeOpacity={0.7}
        >
          <Card style={styles.tripCard} elevation="medium">
            <Text style={styles.cardTitle}>Current Trip</Text>
            <View style={styles.tripDetails}>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Pickup</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentTrip.pickup.address}
                </Text>
              </View>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Dropoff</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentTrip.dropoff.address}
                </Text>
              </View>
              <View style={styles.tripStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{currentTrip.distance} km</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>${currentTrip.fare.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Fare</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{currentTrip.status}</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
            <Button
              title="View Trip Details"
              variant="primary"
              size="small"
              onPress={() => router.push(`/trip/${currentTrip.id}`)}
              style={styles.viewButton}
            />
          </Card>
        </TouchableOpacity>
      )}

      {/* Driver Stats Card */}
      <Card style={styles.statsCard} elevation="medium">
        <Text style={styles.cardTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{driver?.totalTrips || 0}</Text>
            <Text style={styles.statTitle}>Total Trips</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{driver?.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statTitle}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver?.status || '') }]}>
              <Text style={styles.statusText}>{driver?.status || 'unknown'}</Text>
            </View>
            <Text style={styles.statTitle}>Status</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/trips')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.actionIconText}>🚖</Text>
            </View>
            <Text style={styles.actionText}>My Trips</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/earnings')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
              <Text style={styles.actionIconText}>💰</Text>
            </View>
            <Text style={styles.actionText}>Earnings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.actionIconText}>👤</Text>
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help Button */}
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => router.push('/help')}
      >
        <Text style={styles.helpButtonText}>Need Help?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  tripCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tripDetails: {
    marginBottom: SPACING.md,
  },
  addressContainer: {
    marginBottom: SPACING.sm,
  },
  addressLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  addressText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  statsCard: {
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statusBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
    marginBottom: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.surface,
    textTransform: 'capitalize',
  },
  actionsContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.medium,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  helpButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
}); 