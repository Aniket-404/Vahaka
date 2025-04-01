import { Image, StyleSheet, Platform, TextInput, TouchableOpacity, FlatList, View, Animated, Dimensions, StatusBar, ScrollView, findNodeHandle, ActivityIndicator, useWindowDimensions, RefreshControl } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { Driver, TripType, Badge } from '../types/driver';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import React from 'react';
import { useAuth } from '../context/auth';
import { useLocation } from '../context/location';

import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import driverService from '../services/driverService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

const ALL_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'John Doe',
    rating: 4.8,
    trips: 120,
    price: 1200,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    badges: [
      { id: '1', name: 'Business', icon: 'briefcase' },
      { id: '2', name: 'Outstation', icon: 'car-sport' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Smith',
    rating: 4.9,
    trips: 85,
    price: 1500,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    badges: [
      { id: '3', name: 'Weekly', icon: 'calendar' },
      { id: '1', name: 'Business', icon: 'briefcase' }
    ]
  },
  {
    id: '3',
    name: 'Mike Johnson',
    rating: 4.7,
    trips: 150,
    price: 1100,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    badges: [
      { id: '4', name: 'Urgent', icon: 'flash' },
      { id: '2', name: 'Outstation', icon: 'car-sport' }
    ]
  },
  {
    id: '4',
    name: 'David Wilson',
    rating: 4.6,
    trips: 95,
    price: 1300,
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    badges: [
      { id: '3', name: 'Weekly', icon: 'calendar' },
      { id: '4', name: 'Urgent', icon: 'flash' }
    ]
  },
  {
    id: '5',
    name: 'Emily Davis',
    rating: 4.9,
    trips: 210,
    price: 1450,
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    badges: [
      { id: '1', name: 'Business', icon: 'briefcase' },
      { id: '4', name: 'Urgent', icon: 'flash' }
    ]
  },
  {
    id: '6',
    name: 'Robert Taylor',
    rating: 4.5,
    trips: 75,
    price: 980,
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    badges: [
      { id: '2', name: 'Outstation', icon: 'car-sport' },
      { id: '3', name: 'Weekly', icon: 'calendar' }
    ]
  },
  {
    id: '7',
    name: 'Jessica Miller',
    rating: 4.8,
    trips: 110,
    price: 1250,
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    badges: [
      { id: '4', name: 'Urgent', icon: 'flash' },
      { id: '1', name: 'Business', icon: 'briefcase' }
    ]
  }
];

// Trip types for booking
const TRIP_TYPES: TripType[] = [
  { id: '4', name: 'Urgent', icon: 'flash' },
  { id: '2', name: 'Outstation', icon: 'car-sport' },
  { id: '1', name: 'Business', icon: 'briefcase' },
  { id: '3', name: 'Weekly', icon: 'calendar' },
];

// Filter options
const FILTER_OPTIONS = [
  { id: 'price_low', name: 'Price: Low to High', icon: 'trending-up' },
  { id: 'price_high', name: 'Price: High to Low', icon: 'trending-down' },
  { id: 'rating', name: 'Highest Rating', icon: 'star' },
  { id: 'trips', name: 'Most Trips', icon: 'car' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTripType, setSelectedTripType] = useState<string | null>(null);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>(ALL_DRIVERS);
  const [allDrivers, setAllDrivers] = useState<Driver[]>(ALL_DRIVERS);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFilterScrollable, setIsFilterScrollable] = useState(true);
  const [isTripTypeScrollable, setIsTripTypeScrollable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for scrollbar UI
  const [filterContentWidth, setFilterContentWidth] = useState(0);
  const [tripTypeContentWidth, setTripTypeContentWidth] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  
  // Animated values for smooth scrolling
  const filterScrollPos = useRef(new Animated.Value(0)).current;
  const tripTypeScrollPos = useRef(new Animated.Value(0)).current;
  
  const filterListRef = useRef<FlatList>(null);
  const tripTypeListRef = useRef<FlatList>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const { currentCity, isLoading: isLocationLoading, refreshLocation } = useLocation();

  // Fetch drivers from Firestore when component mounts
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching drivers from driverService...');
        const drivers = await driverService.getAllDrivers();
        
        // Debug the data received
        console.log(`Received ${drivers.length} drivers from Firestore`);
        if (drivers.length > 0) {
          console.log('Sample driver data:', JSON.stringify(drivers[0]));
          console.log('Sample driver field types:', 
            Object.entries(drivers[0]).map(([key, value]) => 
              `${key}: ${typeof value}${Array.isArray(value) ? ' (array)' : ''}`
            ).join(', ')
          );
        }
        
        setAllDrivers(drivers);
        setFilteredDrivers(drivers);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        // In case of error, show an empty list
        setAllDrivers([]);
        setFilteredDrivers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Update initial scroll positions to display the scroll indicators
  useEffect(() => {
    filterScrollPos.setValue(0);
    tripTypeScrollPos.setValue(0);
  }, []);

  // Filter drivers when trip type, search query, or dates change
  useEffect(() => {
    if (allDrivers.length === 0) return;
    
    let result = [...allDrivers];
    
    // Filter by trip type
    if (selectedTripType) {
      const selectedType = TRIP_TYPES.find(type => type.id === selectedTripType)?.name.toLowerCase();
      if (selectedType) {
        result = result.filter(driver => 
          driver.badges && 
          Array.isArray(driver.badges) && 
          driver.badges.some(badge => 
            badge && badge.name && badge.name.toLowerCase() === selectedType
          )
        );
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(driver => 
        driver.name.toLowerCase().includes(query)
      );
    }
    
    // In a real app, we would filter by date availability here
    // For this demo, we'll just show all drivers if dates are selected
    if (startDate && endDate) {
      // Simulate filtering by date (in a real app this would check driver availability)
      // For demo purposes, we'll just keep all drivers but could implement actual filtering
    }
    
    // Apply sorting based on active filter
    if (activeFilter) {
      switch(activeFilter) {
        case 'price_low':
          result = [...result].sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          result = [...result].sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result = [...result].sort((a, b) => b.rating - a.rating);
          break;
        case 'trips':
          result = [...result].sort((a, b) => b.trips - a.trips);
          break;
      }
    }
    
    setFilteredDrivers(result);
  }, [selectedTripType, searchQuery, startDate, endDate, activeFilter, allDrivers]);

  const handleConfirmStartDate = (date: Date) => {
    setShowStartDatePicker(false);
    setStartDate(date);
    // If end date is before start date, reset it
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  const handleConfirmEndDate = (date: Date) => {
    setShowEndDatePicker(false);
    setEndDate(date);
  };
  
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Select';
  };

  const renderDriverCard = ({ item }: { item: Driver }) => (
    <TouchableOpacity 
      style={styles.driverCard}
      onPress={() => router.push(`/driver-details?id=${item.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.driverCardHeader}>
      <Image source={{ uri: item.image }} style={styles.driverImage} />
      <View style={styles.driverInfo}>
          <View style={styles.nameAndPriceContainer}>
            <View style={styles.nameAndRatingContainer}>
              <ThemedText style={styles.driverName}>{item.name}</ThemedText>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
                <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
                <View style={styles.tripsSeparator} />
                <Ionicons name="car-outline" size={17} color="#64748B" />
                <ThemedText style={styles.tripsText}>{item.trips} trips</ThemedText>
              </View>
        </View>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceValue}>₹{item.price}</ThemedText>
              <ThemedText style={styles.perDayText}>per day</ThemedText>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.badgeContainer}>
        {item.badges && Array.isArray(item.badges) && item.badges.length > 0 && 
          item.badges.map((badge, i) => (
            <View key={i} style={styles.badge}>
              <Ionicons 
                name={(badge.icon || "star") as any} 
                size={14} 
                color="#2563EB" 
                style={styles.badgeIcon} 
              />
              <ThemedText style={styles.badgeText}>{badge.name}</ThemedText>
            </View>
          ))
        }
      </View>
    </TouchableOpacity>
  );

  // Check if drivers list is empty
  const noDriversFound = filteredDrivers.length === 0 && !isLoading;

  // Add new functions to track content width
  const onFilterContentSizeChange = (width: number) => {
    setFilterContentWidth(width);
    setIsFilterScrollable(width > screenWidth - 32); // 32 for padding
  };
  
  const onTripTypeContentSizeChange = (width: number) => {
    setTripTypeContentWidth(width);
    setIsTripTypeScrollable(width > screenWidth - 32); // 32 for padding
  };
  
  // Calculate scrollbar position and dimensions
  const filterIndicatorWidth = filterContentWidth > 0 
    ? Math.max(15, (screenWidth - 32) * (screenWidth - 32) / (filterContentWidth * 2)) 
    : 0;
    
  const filterIndicatorPosition = filterContentWidth > 0
    ? filterScrollPos.interpolate({
        inputRange: [0, filterContentWidth - (screenWidth - 32)],
        outputRange: [0, (screenWidth - 32) - filterIndicatorWidth],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);
    
  const tripTypeIndicatorWidth = tripTypeContentWidth > 0 
    ? Math.max(15, (screenWidth - 32) * (screenWidth - 32) / (tripTypeContentWidth * 2)) 
    : 0;
    
  const tripTypeIndicatorPosition = tripTypeContentWidth > 0
    ? tripTypeScrollPos.interpolate({
        inputRange: [0, tripTypeContentWidth - (screenWidth - 32)],
        outputRange: [0, (screenWidth - 32) - tripTypeIndicatorWidth],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Fixed Header with Search */}
        <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
          style={styles.headerGradient}
        >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <ThemedText style={styles.headerTitle}>Book a Driver</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Find and book the perfect driver</ThemedText>
            </View>
            
            <TouchableOpacity 
              style={styles.locationSelector}
              onPress={refreshLocation}
            >
              <Ionicons name="location-outline" size={16} color="#fff" />
              <ThemedText style={styles.locationText}>
                {isLocationLoading ? 'Locating...' : currentCity || 'Select Location'}
              </ThemedText>
              {isLocationLoading ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 4, width: 14, height: 14 }} />
              ) : (
                <Ionicons name="chevron-down" size={14} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar - Fixed */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by driver name"
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
      
      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Date Picker Section */}
        <View style={styles.datePickerWrapper}>
          <ThemedText style={styles.filterSectionTitle}>Select Dates</ThemedText>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <ThemedText style={styles.dateText}>
                {startDate ? formatDate(startDate) : 'Start Date'}
              </ThemedText>
            </TouchableOpacity>
            
            <View style={styles.dateDivider} />
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <ThemedText style={styles.dateText}>
                {endDate ? formatDate(endDate) : 'End Date'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter bar */}
        <View style={styles.filterContainer}>
          <ThemedText style={styles.filterSectionTitle}>Sort by</ThemedText>
        <FlatList
            ref={filterListRef}
            data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === item.id && styles.activeFilterButton
                ]}
                onPress={() => {
                  setActiveFilter(activeFilter === item.id ? null : item.id);
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={activeFilter === item.id ? "#2563EB" : "#64748B"}
                  style={styles.filterIcon}
                />
                <ThemedText
                  style={[
                    styles.filterText,
                    activeFilter === item.id && styles.activeFilterText
                  ]}
                >
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            )}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: filterScrollPos } } }],
              { useNativeDriver: false }
            )}
            onContentSizeChange={onFilterContentSizeChange}
          />
          
          {/* Custom Scrollbar */}
          {isFilterScrollable && (
            <View style={styles.scrollbarTrack}>
              <Animated.View 
                style={[
                  styles.scrollbarThumb, 
                  { 
                    width: filterIndicatorWidth,
                    transform: [{ translateX: filterIndicatorPosition }]
                  }
                ]} 
              >
                <View style={styles.scrollbarGlow} />
              </Animated.View>
            </View>
          )}
        </View>
        
        {/* Trip type selection */}
        <View style={styles.tripTypeContainer}>
          <ThemedText style={styles.tripTypeSectionTitle}>Trip Type</ThemedText>
        <FlatList
            ref={tripTypeListRef}
            data={TRIP_TYPES || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tripTypeButton,
                  selectedTripType === item.id && styles.activeTripTypeButton
                ]}
                onPress={() => {
                  setSelectedTripType(selectedTripType === item.id ? null : item.id);
                }}
              >
                <View style={[
                  styles.tripTypeIconContainer,
                  selectedTripType === item.id && styles.activeTripTypeIconContainer
                ]}>
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={selectedTripType === item.id ? "#2563EB" : "#2563EB"}
                  />
                </View>
                <ThemedText style={[
                  styles.tripTypeText,
                  selectedTripType === item.id && styles.activeTripTypeText
                ]}>
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            )}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: tripTypeScrollPos } } }],
              { useNativeDriver: false }
            )}
            onContentSizeChange={onTripTypeContentSizeChange}
          />
          
          {/* Custom Scrollbar */}
          {isTripTypeScrollable && (
            <View style={styles.scrollbarTrack}>
              <Animated.View 
                style={[
                  styles.scrollbarThumb, 
                  { 
                    width: tripTypeIndicatorWidth,
                    transform: [{ translateX: tripTypeIndicatorPosition }]
                  }
                ]} 
              >
                <View style={styles.scrollbarGlow} />
              </Animated.View>
            </View>
          )}
        </View>
        
        {/* Driver list section title */}
        <View style={styles.driverSectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            {filteredDrivers.length} {filteredDrivers.length === 1 ? 'Driver' : 'Drivers'} Available
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={async () => {
              setIsLoading(true);
              try {
                const drivers = await driverService.getAllDrivers();
                setAllDrivers(drivers);
                setFilteredDrivers(drivers);
              } catch (error) {
                console.error('Error refreshing drivers:', error);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Ionicons name="refresh" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
        
        {/* Driver list or loading indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <ThemedText style={styles.loadingText}>Loading drivers...</ThemedText>
          </View>
        ) : (
          <View style={styles.driversContainer}>
            {filteredDrivers.map(driver => (
              <React.Fragment key={driver.id}>
                {renderDriverCard({ item: driver })}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Date Pickers */}
      <DateTimePickerModal
        isVisible={showStartDatePicker}
        mode="date"
        onConfirm={handleConfirmStartDate}
        onCancel={() => setShowStartDatePicker(false)}
        minimumDate={new Date()}
      />
      
      <DateTimePickerModal
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={handleConfirmEndDate}
        onCancel={() => setShowEndDatePicker(false)}
        minimumDate={startDate || new Date()}
        />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  header: {
    paddingTop: STATUS_BAR_HEIGHT + 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
  },
  locationText: {
    color: '#fff',
    marginLeft: 4,
    marginRight: 4,
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#2563EB',
    marginLeft: 6,
  },
  dateSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  filterContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    marginRight: 8,
    marginBottom: 2,
  },
  activeFilterButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  tripTypeContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 8,
  },
  tripTypeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  tripTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 2,
    color: '#334155',
  },
  tripTypeIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tripTypeText: {
    fontSize: 14,
    color: '#334155',
  },
  activeTripTypeButton: {
    backgroundColor: '#2563EB',
  },
  activeTripTypeIconContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeTripTypeText: {
    color: 'white',
  },
  driverList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  driverCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 0,
    borderColor: 'transparent',
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
    paddingTop: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  nameAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
    borderWidth: 0,
    borderColor: 'transparent',
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
    marginTop: 0,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  ratingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  tripsText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  tripsSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 1,
    gap: 4,
    paddingLeft: 4,
    borderWidth: 0,
    borderColor: 'transparent',
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
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderWidth: 0,
    borderColor: 'transparent',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  scrollbarTrack: {
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 1.5,
    marginTop: 12,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  scrollbarThumb: {
    height: 3,
    backgroundColor: '#2563EB',
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollbarGlow: {
    position: 'absolute',
    top: -1,
    bottom: -1,
    left: -3,
    right: -3,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 4,
  },
  mainScrollView: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F8FAFC',
    zIndex: 1,
    position: 'relative',
  },
  driversContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterIcon: {
    marginRight: 8,
  },
  dateDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  datePickerWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  scrollViewContent: {
    paddingTop: 24,
    paddingBottom: 24,
    position: 'relative',
  },
  tripTypeIcon: {
    marginRight: 4,
  },
  tripTypeButtonActive: {
    backgroundColor: '#2563EB',
  },
  tripTypeTextActive: {
    color: 'white',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  filterTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  driverSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
});
