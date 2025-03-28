import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { authService, driverService, tripService } from '../../services';
import { Card } from '../../components/Card';
import { Trip } from '../../models/Trip';

type Period = 'today' | 'week' | 'month' | 'all';

export default function EarningsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>('week');
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    all: 0,
    tripsCompleted: 0,
    totalHours: 0,
    averagePerTrip: 0,
  });
  
  const loadEarnings = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return;
      }

      const tripsData = await tripService.getDriverTrips(user.uid);
      const completedTrips = tripsData.filter(trip => trip.status === 'completed');
      
      setTrips(completedTrips);
      calculateEarnings(completedTrips);
    } catch (error) {
      console.error('Error loading earnings:', error);
      Alert.alert('Error', 'Failed to load your earnings data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEarnings();
  };

  const calculateEarnings = (completedTrips: Trip[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let totalMinutes = 0;
    
    completedTrips.forEach(trip => {
      const completedDate = trip.timestamps.completed ? new Date(trip.timestamps.completed).getTime() : 0;
      const fare = trip.fare || 0;
      
      // Total earnings
      totalEarnings += fare;
      
      // Today's earnings
      if (completedDate >= today) {
        todayEarnings += fare;
      }
      
      // This week's earnings
      if (completedDate >= weekStart) {
        weekEarnings += fare;
      }
      
      // This month's earnings
      if (completedDate >= monthStart) {
        monthEarnings += fare;
      }
      
      // Total hours
      totalMinutes += trip.duration || 0;
    });
    
    const averagePerTrip = completedTrips.length > 0 ? totalEarnings / completedTrips.length : 0;
    
    setEarnings({
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      all: totalEarnings,
      tripsCompleted: completedTrips.length,
      totalHours: totalMinutes / 60,
      averagePerTrip,
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getActivePeriodEarnings = () => {
    switch (activePeriod) {
      case 'today': return earnings.today;
      case 'week': return earnings.week;
      case 'month': return earnings.month;
      case 'all': return earnings.all;
      default: return 0;
    }
  };

  const getPeriodText = () => {
    switch (activePeriod) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return '';
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Main Earnings Card */}
      <Card style={styles.earningsCard}>
        <Text style={styles.earningsTitle}>{getPeriodText()} Earnings</Text>
        <Text style={styles.earningsAmount}>{formatCurrency(getActivePeriodEarnings())}</Text>
        
        {/* Time period selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, activePeriod === 'today' && styles.activePeriodButton]}
            onPress={() => setActivePeriod('today')}
          >
            <Text style={[styles.periodText, activePeriod === 'today' && styles.activePeriodText]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, activePeriod === 'week' && styles.activePeriodButton]}
            onPress={() => setActivePeriod('week')}
          >
            <Text style={[styles.periodText, activePeriod === 'week' && styles.activePeriodText]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, activePeriod === 'month' && styles.activePeriodButton]}
            onPress={() => setActivePeriod('month')}
          >
            <Text style={[styles.periodText, activePeriod === 'month' && styles.activePeriodText]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, activePeriod === 'all' && styles.activePeriodButton]}
            onPress={() => setActivePeriod('all')}
          >
            <Text style={[styles.periodText, activePeriod === 'all' && styles.activePeriodText]}>
              All
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{earnings.tripsCompleted}</Text>
          <Text style={styles.statLabel}>Trips Completed</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{earnings.totalHours.toFixed(1)} hrs</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </Card>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(earnings.averagePerTrip)}</Text>
          <Text style={styles.statLabel}>Avg. per Trip</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(earnings.totalHours > 0 ? earnings.all / earnings.totalHours : 0)}</Text>
          <Text style={styles.statLabel}>Avg. per Hour</Text>
        </Card>
      </View>

      {/* Recent Earnings */}
      <Card style={styles.recentCard}>
        <Text style={styles.cardTitle}>Recent Earnings</Text>
        
        {trips.length > 0 ? (
          <View>
            {trips.slice(0, 5).map((trip) => (
              <View key={trip.id} style={styles.recentTripItem}>
                <View>
                  <Text style={styles.tripDate}>
                    {new Date(trip.timestamps.completed || trip.timestamps.requested).toLocaleDateString()}
                  </Text>
                  <Text numberOfLines={1} style={styles.tripRoute}>
                    {trip.pickup.address.split(',')[0]} → {trip.dropoff.address.split(',')[0]}
                  </Text>
                </View>
                <Text style={styles.tripFare}>{formatCurrency(trip.fare)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed trips yet</Text>
          </View>
        )}
      </Card>
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
  earningsCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  earningsTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  earningsAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  periodButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
  },
  activePeriodButton: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activePeriodText: {
    color: COLORS.surface,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  recentCard: {
    marginTop: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  recentTripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tripDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  tripRoute: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    maxWidth: 220,
  },
  tripFare: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  emptyContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
}); 