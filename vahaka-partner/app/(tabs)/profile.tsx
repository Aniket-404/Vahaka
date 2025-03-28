import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import { authService, driverService } from '../../services';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Driver } from '../../models/Driver';

export default function ProfileScreen() {
  const [driver, setDriver] = useState<Driver | null>(null);
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
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
      Alert.alert('Error', 'Failed to load your profile data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDriverData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logoutDriver();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
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
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {driver?.profileImage ? (
            <Image
              source={{ uri: driver.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageInitials}>
                {driver?.name
                  ? driver.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                  : '?'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{driver?.name || 'Driver'}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver?.status || '') }]}>
            <Text style={styles.statusText}>{driver?.status || 'Unknown'}</Text>
          </View>
        </View>
      </View>

      {/* Personal Information */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          <Text style={styles.infoValue}>{driver?.phone || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{driver?.email || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience</Text>
          <Text style={styles.infoValue}>{driver?.experience || 0} years</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>About</Text>
          <Text style={styles.infoValue}>{driver?.about || 'No information provided'}</Text>
        </View>
        
        <Button
          title="Edit Personal Info"
          variant="outline"
          size="small"
          onPress={() => router.push('/profile/edit-personal')}
          style={styles.button}
        />
      </Card>

      {/* Vehicle Information */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Vehicle</Text>
          <Text style={styles.infoValue}>
            {driver?.vehicle?.make && driver?.vehicle?.model
              ? `${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.year})`
              : 'Not provided'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Color</Text>
          <Text style={styles.infoValue}>{driver?.vehicle?.color || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Plate Number</Text>
          <Text style={styles.infoValue}>{driver?.vehicle?.plateNumber || 'Not provided'}</Text>
        </View>
        
        <Button
          title="Edit Vehicle Info"
          variant="outline"
          size="small"
          onPress={() => router.push('/profile/edit-vehicle')}
          style={styles.button}
        />
      </Card>

      {/* License Information */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>License Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>License Number</Text>
          <Text style={styles.infoValue}>{driver?.license?.number || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Expiry Date</Text>
          <Text style={styles.infoValue}>
            {driver?.license?.expiryDate 
              ? new Date(driver.license.expiryDate).toLocaleDateString() 
              : 'Not provided'}
          </Text>
        </View>
        
        <Button
          title="Edit License Info"
          variant="outline"
          size="small"
          onPress={() => router.push('/profile/edit-license')}
          style={styles.button}
        />
      </Card>

      {/* Documents */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Documents</Text>
        
        <TouchableOpacity 
          style={styles.documentItem}
          onPress={() => router.push('/profile/documents')}
        >
          <Text style={styles.documentTitle}>View All Documents</Text>
          <Text style={styles.documentArrow}>→</Text>
        </TouchableOpacity>
      </Card>

      {/* Account Actions */}
      <View style={styles.accountActions}>
        <Button
          title="Change Password"
          variant="outline"
          onPress={() => router.push('/profile/change-password')}
          style={styles.accountButton}
          fullWidth
        />
        
        <Button
          title="Logout"
          variant="error"
          onPress={handleLogout}
          style={styles.accountButton}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return COLORS.success;
    case 'pending': return COLORS.warning;
    case 'rejected': return COLORS.error;
    default: return COLORS.textSecondary;
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
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profileImageContainer: {
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitials: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoItem: {
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  button: {
    marginTop: SPACING.sm,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: SPACING.sm,
  },
  documentTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  documentArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  accountActions: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  accountButton: {
    marginBottom: SPACING.md,
  },
}); 