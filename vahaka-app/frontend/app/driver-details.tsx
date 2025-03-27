import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, StatusBar, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Dummy driver data - in a real app, this would come from an API
const DRIVERS: { [key: string]: {
  id: string;
  name: string;
  rating: number;
  trips: number;
  price: number;
  image: string;
  badges: string[];
  description: string;
  languages: string[];
  vehicle: string;
  vehicleImage: string;
  reviews: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}} = {
  '1': {
    id: '1',
    name: 'John Doe',
    rating: 4.8,
    trips: 120,
    price: 1200,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    badges: ['Business', 'Outstation'],
    description: 'Professional driver with 5+ years of experience. Specializes in business trips and outstation journeys. Excellent knowledge of highways and city routes.',
    languages: ['English', 'Hindi'],
    vehicle: 'Toyota Innova Crysta',
    vehicleImage: 'https://imgd.aeplcdn.com/642x361/n/cw/ec/51435/innova-crysta-exterior-right-front-three-quarter-2.jpeg?q=75',
    reviews: [
      { id: '1', user: 'Alex M.', rating: 5, comment: 'Very professional and punctual. Made our business trip hassle-free.', date: '10 Mar 2024' },
      { id: '2', user: 'Sarah K.', rating: 4, comment: 'Good driving skills and knows the city well.', date: '02 Feb 2024' },
    ]
  },
  '2': {
    id: '2',
    name: 'Sarah Smith',
    rating: 4.9,
    trips: 85,
    price: 1500,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    badges: ['Weekly', 'Business'],
    description: 'Experienced driver specialized in weekly bookings. Known for safe driving and excellent customer service. Preferred by business executives.',
    languages: ['English', 'Hindi', 'Gujarati'],
    vehicle: 'Honda City ZX',
    vehicleImage: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/134287/city-exterior-right-front-three-quarter-3.jpeg?isig=0&q=75',
    reviews: [
      { id: '1', user: 'Rajat S.', rating: 5, comment: 'Outstanding service! Sarah made our week-long trip very comfortable.', date: '21 Mar 2024' },
      { id: '2', user: 'Priya L.', rating: 5, comment: 'Very professional and friendly. Would definitely book again.', date: '15 Feb 2024' },
    ]
  },
  '3': {
    id: '3',
    name: 'Mike Johnson',
    rating: 4.7,
    trips: 150,
    price: 1100,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    badges: ['Urgent', 'Outstation'],
    description: 'Quick response driver for urgent bookings. Experienced in outstation trips with excellent highway driving skills.',
    languages: ['English', 'Hindi', 'Marathi'],
    vehicle: 'Maruti Suzuki Dzire',
    vehicleImage: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/45691/dzire-exterior-right-front-three-quarter-3.jpeg?q=75',
    reviews: [
      { id: '1', user: 'Vikram J.', rating: 4, comment: 'Reached within minutes for our urgent requirement. Good driving.', date: '25 Mar 2024' },
      { id: '2', user: 'Meera P.', rating: 5, comment: 'Very helpful during our outstation trip. Knows all the good spots.', date: '11 Mar 2024' },
    ]
  },
};

export default function DriverDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [tripDuration, setTripDuration] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  
  // Animation for footer
  const footerAnimation = useRef(new Animated.Value(0)).current;
  
  // Get driver details based on ID
  const driverId = typeof id === 'string' ? id : '1';
  const driver = DRIVERS[driverId];
  
  if (!driver) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Driver not found</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backLink}>Go Back</ThemedText>
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
        while (tempStart < end) {
          const dateString = tempStart.toISOString().split('T')[0];
          markedDates[dateString] = { 
            color: '#153450', 
            textColor: '#ffffff' 
          };
          tempStart.setDate(tempStart.getDate() + 1);
        }
      }
    }
    
    return markedDates;
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return 'Not selected';
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Animate footer when dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      Animated.sequence([
        Animated.timing(footerAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(footerAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [startDate, endDate]);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          />
          <Image 
            source={{ uri: driver.image }} 
            style={styles.headerImage} 
          />
        </View>
        
        <ThemedView style={styles.driverInfoContainer}>
          <View style={styles.driverHeader}>
            <View>
              <ThemedText type="title">{driver.name}</ThemedText>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <ThemedText style={styles.ratingText}>
                  {driver.rating} • {driver.trips} trips
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.badgeContainer}>
            {driver.badges.map((badge: string, index: number) => (
              <View key={index} style={styles.badge}>
                <ThemedText style={styles.badgeText}>{badge}</ThemedText>
              </View>
            ))}
          </View>
          
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>About Driver</ThemedText>
            <ThemedText style={styles.description}>{driver.description}</ThemedText>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={20} color="#4a90e2" />
                <ThemedText style={styles.detailText}>{driver.vehicle}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="language-outline" size={20} color="#4a90e2" />
                <ThemedText style={styles.detailText}>{driver.languages.join(', ')}</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          <ThemedView style={styles.priceBreakdownContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Price Breakdown</ThemedText>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceRowText}>Driver Charges (₹{driver.price}/day × {tripDuration} days)</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.priceRowText}>₹{totalPrice}</ThemedText>
            </View>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceRowText}>Food & Stay Allowance</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.priceRowText}>₹{allowancePrice}</ThemedText>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <ThemedText type="defaultSemiBold" style={styles.priceRowText}>Total Amount</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.totalPrice}>₹{finalPrice}</ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Reviews</ThemedText>
              <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
                <ThemedText style={styles.viewAllText}>
                  {showReviews ? 'Show Less' : 'View All'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {driver.reviews.slice(0, showReviews ? undefined : 1).map((review: {
              id: string;
              user: string;
              rating: number;
              comment: string;
              date: string;
            }) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <ThemedText style={styles.reviewUserName}>{review.user}</ThemedText>
                  <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
                </View>
                <View style={styles.reviewRating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons 
                      key={i}
                      name={i < review.rating ? "star" : "star-outline"} 
                      size={16} 
                      color="#FFD700" 
                      style={styles.reviewStar}
                    />
                  ))}
                </View>
                <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
              </View>
            ))}
          </ThemedView>
          
          <ThemedView style={[styles.section, styles.calendarSection]}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Select Dates</ThemedText>
            </View>
            
            <View style={styles.dateSelectionContainer}>
              <View style={styles.dateInfoRow}>
                <View style={styles.dateInfo}>
                  <ThemedText style={styles.dateLabel}>Start Date:</ThemedText>
                  <ThemedText style={styles.selectedDateText}>
                    {startDate ? formatDate(startDate) : "Not selected"}
                  </ThemedText>
                </View>
                
                <View style={styles.dateInfo}>
                  <ThemedText style={styles.dateLabel}>End Date:</ThemedText>
                  <ThemedText style={styles.selectedDateText}>
                    {endDate 
                      ? (startDate === endDate ? "Same Day" : formatDate(endDate))
                      : "Not selected"}
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.calendarHelpText}>
                {!startDate 
                  ? "Tap a date to select for a single day booking" 
                  : (startDate === endDate)
                    ? "Tap the same date to cancel, or a different date to select a range" 
                    : "Tap any date to reset and start over"}
              </ThemedText>
              
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={getMarkedDates()}
                markingType="period"
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  calendarBackground: '#121212',
                  textSectionTitleColor: '#4a90e2',
                  selectedDayBackgroundColor: '#4a90e2',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#4a90e2',
                  dayTextColor: '#ffffff',
                  textDisabledColor: '#666666',
                  dotColor: '#4a90e2',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#4a90e2',
                  monthTextColor: '#ffffff',
                  indicatorColor: '#4a90e2',
                  'stylesheet.calendar.header': {
                    header: {
                      backgroundColor: '#121212',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 10
                    },
                    monthText: {
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 'bold'
                    }
                  }
                }}
                style={styles.calendar}
              />
              
              {startDate && endDate && (
                <View style={styles.tripDurationInfo}>
                  <Ionicons name="time-outline" size={20} color="#4a90e2" style={styles.durationIcon} />
                  <ThemedText style={styles.durationText}>
                    {tripDuration === 1 
                      ? "Single day booking" 
                      : `Trip duration: ${tripDuration} days`}
                  </ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        </ThemedView>
      </ScrollView>
      
      {/* Fixed footer with price and booking button */}
      <Animated.View 
        style={[
          styles.footer,
          { 
            transform: [{ translateY: footerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -10]
            }) }] 
          }
        ]}
      >
        <View style={styles.footerPriceContainer}>
          <View style={styles.footerPriceRow}>
            <ThemedText type="defaultSemiBold" style={styles.footerPrice}>₹{finalPrice}</ThemedText>
            <View style={styles.availabilityBadge}>
              <ThemedText style={styles.availabilityText}>Available</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.footerPriceDetail}>for {tripDuration} days</ThemedText>
        </View>
        <TouchableOpacity 
          style={[
            styles.bookButton,
            (!startDate || !endDate) && styles.disabledBookButton
          ]}
          disabled={!startDate || !endDate}
          onPress={() => {
            if (startDate && endDate) {
              router.push({
                pathname: '/booking-confirmation',
                params: { 
                  bookingId: Math.floor(Math.random() * 1000000).toString() 
                }
              });
            }
          }}
        >
          <ThemedText style={[
            styles.bookButtonText,
            (!startDate || !endDate) && styles.disabledBookButtonText
          ]}>
            {(startDate && endDate) ? "Book Now" : "Select Dates"}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: 250,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  driverInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#aaaaaa',
  },
  favoriteButton: {
    padding: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#153450',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  description: {
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
    color: '#aaaaaa',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  detailsContainer: {
    marginTop: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 0,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#aaaaaa',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  viewAllText: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '600',
    padding: 4,
  },
  reviewItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reviewDate: {
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: '500',
  },
  reviewRating: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  reviewStar: {
    marginHorizontal: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
    color: '#cccccc',
    letterSpacing: 0.3,
  },
  dateSelectionContainer: {
    marginTop: 16,
  },
  dateInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dateInfo: {
    flexDirection: 'column',
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 8,
    fontWeight: '600',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 120,
    textAlign: 'center',
  },
  tripDurationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#153450',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  durationIcon: {
    marginRight: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  priceBreakdownContainer: {
    marginTop: 24,
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  totalPrice: {
    color: '#4a90e2',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  footerPriceContainer: {
    flex: 1,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerPrice: {
    fontSize: 18,
    color: '#4a90e2',
  },
  availabilityBadge: {
    backgroundColor: '#153450',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '500',
  },
  footerPriceDetail: {
    fontSize: 12,
    color: '#aaaaaa',
  },
  bookButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    color: '#4a90e2',
    marginTop: 8,
  },
  priceRowText: {
    color: '#cccccc',
    fontSize: 14,
  },
  calendar: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  calendarHelpText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.7)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 84,
  },
  disabledBookButton: {
    backgroundColor: '#505050',
    opacity: 1,
  },
  calendarSection: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
  },
  disabledBookButtonText: {
    color: '#aaaaaa',
  },
  sameDayBadge: {
    backgroundColor: '#153450',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'center',
  },
  sameDayText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '500',
  },
}); 