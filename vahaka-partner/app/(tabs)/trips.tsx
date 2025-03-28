import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { authService, tripService } from '../../services';
import { Card } from '../../components/Card';
import { Trip } from '../../models/Trip';

type FilterType = 'all' | 'active' | 'completed';

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const router = useRouter();

  const loadTrips = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        // Not logged in, redirect to login
        router.replace('/auth/login');
        return;
      }

      const tripsData = await tripService.getDriverTrips(user.uid);
      setTrips(tripsData);
      filterTrips(tripsData, activeFilter);
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Error', 'Failed to load your trips');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const filterTrips = (tripsData: Trip[], filter: FilterType) => {
    if (filter === 'all') {
      setFilteredTrips(tripsData);
    } else if (filter === 'active') {
      setFilteredTrips(
        tripsData.filter(trip => 
          trip.status === 'pending' || 
          trip.status === 'accepted' || 
          trip.status === 'started'
        )
      );
    } else if (filter === 'completed') {
      setFilteredTrips(
        tripsData.filter(trip => 
          trip.status === 'completed' || 
          trip.status === 'cancelled'
        )
      );
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    filterTrips(trips, filter);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      onPress={() => router.push(`/trip/${item.id}`)}
      activeOpacity={0.7}
      style={styles.cardContainer}
    >
      <Card style={[styles.tripCard, getTripCardStyle(item.status)]}>
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderLeft}>
            <Text style={styles.tripDate}>
              {formatDate(item.timestamps.requested)}
            </Text>
            <Text style={styles.tripTime}>
              {formatTime(item.timestamps.requested)}
            </Text>
          </View>
          <View style={[styles.statusBadge, getTripStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {item.pickup.address}
            </Text>
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Dropoff</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {item.dropoff.address}
            </Text>
          </View>
        </View>

        <View style={styles.tripFooter}>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Distance</Text>
            <Text style={styles.tripStatValue}>{item.distance} km</Text>
          </View>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Duration</Text>
            <Text style={styles.tripStatValue}>{item.duration} min</Text>
          </View>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Fare</Text>
            <Text style={styles.tripStatValue}>${item.fare.toFixed(2)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getTripCardStyle = (status: Trip['status']) => {
    if (status === 'completed') {
      return { borderLeftColor: COLORS.success };
    } else if (status === 'cancelled') {
      return { borderLeftColor: COLORS.error };
    } else if (status === 'pending') {
      return { borderLeftColor: COLORS.warning };
    } else {
      return { borderLeftColor: COLORS.primary };
    }
  };

  const getTripStatusStyle = (status: Trip['status']) => {
    if (status === 'completed') {
      return { backgroundColor: COLORS.success };
    } else if (status === 'cancelled') {
      return { backgroundColor: COLORS.error };
    } else if (status === 'pending') {
      return { backgroundColor: COLORS.warning };
    } else if (status === 'accepted') {
      return { backgroundColor: COLORS.primary };
    } else {
      return { backgroundColor: COLORS.secondary };
    }
  };

  return (
    <View style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.activeFilterButton,
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'all' && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'active' && styles.activeFilterButton,
          ]}
          onPress={() => handleFilterChange('active')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'active' && styles.activeFilterText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'completed' && styles.activeFilterButton,
          ]}
          onPress={() => handleFilterChange('completed')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'completed' && styles.activeFilterText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip list */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Trips Found</Text>
            <Text style={styles.emptyMessage}>
              {isLoading
                ? 'Loading your trips...'
                : activeFilter === 'all'
                ? 'You have not taken any trips yet.'
                : `You don't have any ${activeFilter} trips.`}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.surface,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  tripCard: {
    borderLeftWidth: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tripHeaderLeft: {},
  tripDate: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  tripTime: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.surface,
    textTransform: 'capitalize',
  },
  tripDetails: {
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  addressContainer: {
    marginBottom: SPACING.xs,
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
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripStat: {
    alignItems: 'center',
  },
  tripStatLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  tripStatValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
}); 