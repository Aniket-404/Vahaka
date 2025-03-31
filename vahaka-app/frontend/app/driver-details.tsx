import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, StatusBar, Animated, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';

import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import driverService from './services/driverService';

// Type for driver in driver details
interface DriverDetails {
  id: string;
  name: string;
  rating: number;
  trips: number;
  price: number;
  image: string;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
  }> | null;
  description?: string;
  languages?: string[] | null;
  vehicle?: string | {
    make: string;
    model: string;
    color?: string;
    plateNumber?: string;
  } | null;
  vehicleImage?: string;
  reviews?: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }> | null;
  experience?: number;
  status?: string;
  phoneNumber?: string;
  email?: string;
  location?: any;
  license?: any;
  preferences?: any;
  vehicleDetails?: any;
}

export default function DriverDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [tripDuration, setTripDuration] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animation for footer
  const footerAnimation = useRef(new Animated.Value(0)).current;
  
  // Get driver details based on ID
  const driverId = typeof id === 'string' ? id : '';
  
  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching driver details for ID:', driverId);
        const data = await driverService.getDriverById(driverId);
        
        // Debug the data received from Firestore
        console.log('Driver data received:', data ? JSON.stringify(data) : 'No data');
        if (data) {
          console.log('Driver data field types:', 
            Object.entries(data).map(([key, value]) => 
              `${key}: ${typeof value}${Array.isArray(value) ? ' (array)' : ''}`
            ).join(', ')
          );
          
          // Add more specific debug logging for rating and trips fields
          console.log('RATING data:', {
            rating: data.rating,
            ratingType: typeof data.rating,
            ratingValue: Number(data.rating)
          });
          console.log('TRIPS data:', {
            trips: data.trips,
            tripsType: typeof data.trips,
            tripsValue: Number(data.trips)
          });
          console.log('EXPERIENCE data:', {
            experience: data.experience,
            experienceType: typeof data.experience,
            experienceValue: Number(data.experience)
          });
        }
        
        if (data) {
          setDriver(data);
        } else {
          console.error('No driver data returned from getDriverById');
          setError('Driver not found');
        }
      } catch (error) {
        console.error('Error fetching driver details:', error);
        setError('Failed to load driver details');
      } finally {
        setIsLoading(false);
      }
    };

    if (driverId) {
      fetchDriverDetails();
    } else {
      setError('Invalid driver ID');
      setIsLoading(false);
    }
  }, [driverId]);
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={styles.loadingText}>Loading driver details...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error || !driver) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error || 'Driver not found'}</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  // Calculate total price
  const totalPrice = driver.price * tripDuration;
  const allowancePrice = 500 * tripDuration;
  const finalPrice = totalPrice + allowancePrice;
  
  // Handle date selection
  const handleDateSelect = (day: DateData) => {
    const selectedDate = day.dateString;
    
    if (!startDate) {
      // First selection - set as start date
      setStartDate(selectedDate);
      // For single day booking, also set as end date
      setEndDate(selectedDate);
      setTripDuration(1);
    } else if (startDate && endDate && startDate === endDate) {
      // If we already have a single day selected, and user selects another date
      if (selectedDate !== startDate) {
        // If selected date is before start date, swap them
        if (new Date(selectedDate) < new Date(startDate)) {
          setStartDate(selectedDate);
          // Keep end date as is
        } else {
          setEndDate(selectedDate);
        }
        
        // Calculate duration between dates
        const start = new Date(startDate);
        const end = new Date(selectedDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTripDuration(diffDays);
      } else {
        // User tapped the same date again, reset selection
        setStartDate(null);
        setEndDate(null);
        setTripDuration(1);
      }
    } else if (startDate && endDate) {
      // If we already have a range selected, reset and start over
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      setTripDuration(1);
    }
  };
  
  // Format dates for calendar marking
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    if (startDate && endDate) {
      if (startDate === endDate) {
        // Single day selection
        markedDates[startDate] = { 
          selected: true,
          color: '#4a90e2', 
          textColor: 'white',
          startingDay: true,
          endingDay: true
        };
      } else {
        // Multi-day selection
        let start = new Date(startDate);
        let end = new Date(endDate);
        
        // Swap if necessary to ensure start is before end
        if (start > end) {
          [start, end] = [end, start];
          const tempStart = startDate;
          setStartDate(endDate);
          setEndDate(tempStart);
        }
        
        // Mark start date
        markedDates[startDate] = { 
          startingDay: true, 
          color: '#4a90e2', 
          textColor: 'white' 
        };
        
        // Mark end date
        markedDates[endDate] = { 
          endingDay: true, 
          color: '#4a90e2', 
          textColor: 'white' 
        };
        
        // Add one day to start
        const tempStart = new Date(start);
        tempStart.setDate(tempStart.getDate() + 1);
        
        // Mark all dates in between
        let currentDate = tempStart;
        while (currentDate < end) {
          markedDates[currentDate.toISOString().split('T')[0]] = { 
            color: '#e6f2ff', 
            textColor: '#4a90e2' 
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }
    
    return markedDates;
  };
  
  // Format date for display
  const formatDate = (date: string | null) => {
    if (!date) return 'Select';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render driver profile section
  const renderDriverProfile = () => (
    <View style={styles.driverProfileContainer}>
      <View style={styles.driverCardHeader}>
        <Image source={{ uri: driver.image }} style={styles.driverImage} />
        <View style={styles.driverInfo}>
          <View style={styles.nameAndPriceContainer}>
            <View style={styles.nameAndRatingContainer}>
              <ThemedText style={styles.driverName}>{driver.name}</ThemedText>
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <ThemedText style={styles.ratingText}>{driver.rating.toFixed(1)} • {driver.trips} trips</ThemedText>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceValue}>₹{driver.price}</ThemedText>
              <ThemedText style={styles.perDayText}>per day</ThemedText>
            </View>
          </View>
        </View>
        </View>
        
        <View style={styles.badgeContainer}>
        {driver.badges && driver.badges.length > 0 ? (
          driver.badges.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Ionicons 
                name={(badge.icon || "star") as any} 
                size={14} 
                color="#2563EB" 
                style={styles.badgeIcon} 
              />
              <ThemedText style={styles.badgeText}>{badge.name}</ThemedText>
            </View>
          ))
        ) : null}
      </View>
    </View>
  );

  // Render driver bio section
  const renderDriverBio = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>About Driver</ThemedText>
      
      <ThemedText style={styles.bioText}>
        {driver.description}
      </ThemedText>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="car-outline" size={24} color="#2563EB" />
          <ThemedText style={styles.statValue}>{driver.trips}</ThemedText>
          <ThemedText style={styles.statLabel}>Trips</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color="#2563EB" />
          <ThemedText style={styles.statValue}>{driver.experience}+</ThemedText>
          <ThemedText style={styles.statLabel}>Years</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="location-outline" size={24} color="#2563EB" />
          <ThemedText style={styles.statValue}>Local</ThemedText>
          <ThemedText style={styles.statLabel}>Expert</ThemedText>
            </View>
            </View>
          </View>
  );

  // Render vehicle section
  const renderVehicle = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Vehicle</ThemedText>
      
      <View style={styles.vehicleContainer}>
        <View style={styles.vehicleInfo}>
          {typeof driver.vehicle === 'string' ? (
            <ThemedText style={styles.vehicleName}>{driver.vehicle}</ThemedText>
          ) : (
            <>
              <ThemedText style={styles.vehicleName}>
                {(driver.vehicle as {make: string, model: string}).make} {(driver.vehicle as {make: string, model: string}).model}
              </ThemedText>
              
              <View style={styles.vehicleDetailsGrid}>
                <View style={styles.vehicleDetailColumn}>
                  {(driver.vehicle as {color?: string})?.color && (
                    <ThemedText style={styles.vehicleFeature}>
                      <Ionicons name="color-palette-outline" size={16} color="#10B981" /> {(driver.vehicle as {color: string}).color}
                    </ThemedText>
                  )}
                  
                  <ThemedText style={styles.vehicleFeature}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" /> Air Conditioned
                  </ThemedText>
                </View>
                
                <View style={styles.vehicleDetailColumn}>
                  {(driver.vehicle as {plateNumber?: string})?.plateNumber && (
                    <ThemedText style={styles.vehicleFeature}>
                      <Ionicons name="car-outline" size={16} color="#10B981" /> {(driver.vehicle as {plateNumber: string}).plateNumber}
                    </ThemedText>
                  )}
                  
                  <ThemedText style={styles.vehicleFeature}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" /> Well Maintained
                  </ThemedText>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  // Render reviews section
  const renderReviews = () => (
    <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>
        {driver.reviews && driver.reviews.length > 0 && (
            <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
            <ThemedText style={styles.seeAllButton}>
              {showReviews ? 'See Less' : 'See All'}
              </ThemedText>
            </TouchableOpacity>
        )}
          </View>
          
      {driver.reviews && driver.reviews.length > 0 ? (
        <>
          {(showReviews ? driver.reviews : driver.reviews.slice(0, 2)).map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <ThemedText style={styles.reviewUser}>{review.user}</ThemedText>
              <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                      key={star}
                      name="star"
                    size={14} 
                      color={star <= review.rating ? "#FFD700" : "#E2E8F0"}
                      style={{ marginRight: 2 }}
                  />
                ))}
                </View>
              </View>
              <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
              <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.noReviewsContainer}>
          <ThemedText style={styles.noReviewsText}>No reviews yet</ThemedText>
        </View>
      )}
    </View>
  );

  // Render calendar section for booking
  const renderCalendar = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Select Dates</ThemedText>
      
      <View style={styles.dateSelectionContainer}>
        <View style={styles.dateBox}>
          <ThemedText style={styles.dateLabel}>From</ThemedText>
          <ThemedText style={styles.dateValue}>{formatDate(startDate)}</ThemedText>
        </View>
        
        <View style={styles.dateArrow}>
          <Ionicons name="arrow-forward" size={20} color="#CBD5E1" />
        </View>
        
        <View style={styles.dateBox}>
          <ThemedText style={styles.dateLabel}>To</ThemedText>
          <ThemedText style={styles.dateValue}>{formatDate(endDate)}</ThemedText>
        </View>
      </View>
      
      <Calendar
        style={styles.calendar}
        theme={{
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#334155',
          selectedDayBackgroundColor: '#4a90e2',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#2563EB',
          dayTextColor: '#334155',
          textDisabledColor: '#CBD5E1',
          dotColor: '#4a90e2',
          arrowColor: '#2563EB',
          monthTextColor: '#334155',
        }}
        minDate={new Date().toISOString().split('T')[0]}
        markedDates={getMarkedDates()}
        markingType="period"
        onDayPress={handleDateSelect}
      />
    </View>
  );

  // Render price breakdown
  const renderPriceBreakdown = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Price Breakdown</ThemedText>
      
      <View style={styles.priceBreakdownItem}>
        <ThemedText style={styles.priceBreakdownLabel}>
          Daily Rate × {tripDuration} {tripDuration === 1 ? 'day' : 'days'}
              </ThemedText>
        <ThemedText style={styles.priceBreakdownValue}>₹{totalPrice}</ThemedText>
      </View>
      
      <View style={styles.priceBreakdownItem}>
        <ThemedText style={styles.priceBreakdownLabel}>
          Daily Allowance × {tripDuration} {tripDuration === 1 ? 'day' : 'days'}
              </ThemedText>
        <ThemedText style={styles.priceBreakdownValue}>₹{allowancePrice}</ThemedText>
            </View>
      
      <View style={styles.priceDivider} />
      
      <View style={styles.priceBreakdownItem}>
        <ThemedText style={styles.priceBreakdownTotal}>Total</ThemedText>
        <ThemedText style={styles.priceBreakdownTotalValue}>₹{finalPrice}</ThemedText>
          </View>
          </View>
  );
  
  // Updated return statement to rely on the built-in layout header
  return (
    <ThemedView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderDriverProfile()}
        {renderDriverBio()}
        {renderVehicle()}
        {renderReviews()}
        {renderCalendar()}
        {renderPriceBreakdown()}
      </ScrollView>
      
      {/* Fixed booking button */}
      <View style={styles.footer}>
        <View style={styles.footerPriceContainer}>
          <ThemedText style={styles.footerPriceValue}>₹{finalPrice}</ThemedText>
          <ThemedText style={styles.footerPriceLabel}>
            {startDate && endDate 
              ? `Total for ${tripDuration} ${tripDuration === 1 ? 'day' : 'days'}`
              : 'Select dates to view total'}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.bookButton,
            (!startDate || !endDate) && styles.bookButtonDisabled
          ]}
          onPress={() => router.push(`/booking-confirmation?driverId=${driver.id}&startDate=${startDate}&endDate=${endDate}`)}
          disabled={!startDate || !endDate}
        >
          <ThemedText style={styles.bookButtonText}>
            {startDate && endDate ? 'Book Now' : 'Select Dates'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  driverProfileContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  driverCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  nameAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  nameAndRatingContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 0,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  perDayText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: -2,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 1,
    gap: 4,
    paddingLeft: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#2563EB',
    marginLeft: 4,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  vehicleContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 8,
  },
  vehicleInfo: {
    width: '100%',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  vehicleDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  vehicleDetailColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  vehicleFeature: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    fontSize: 14,
    color: '#2563EB',
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewComment: {
    fontSize: 14,
    color: '#334155',
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  noReviewsContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  dateSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateArrow: {
    marginHorizontal: 12,
  },
  calendar: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  priceBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceBreakdownLabel: {
    fontSize: 14,
    color: '#334155',
  },
  priceBreakdownValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  priceBreakdownTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceBreakdownTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  footerPriceContainer: {
    flex: 1,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  footerPriceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  bookButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
}); 