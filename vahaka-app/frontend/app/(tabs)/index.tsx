import { Image, StyleSheet, Platform, TextInput, TouchableOpacity, FlatList, View, Animated, Dimensions, StatusBar, ScrollView, findNodeHandle } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Driver, TripType, Badge } from '../types/driver';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFilterScrollable, setIsFilterScrollable] = useState(true);
  const [isTripTypeScrollable, setIsTripTypeScrollable] = useState(true);
  
  // Animated values for smooth scrolling
  const filterScrollPos = useRef(new Animated.Value(0)).current;
  const tripTypeScrollPos = useRef(new Animated.Value(0)).current;
  
  const filterListRef = useRef<FlatList>(null);
  const tripTypeListRef = useRef<FlatList>(null);
  
  const router = useRouter();

  // Update initial scroll positions to display the scroll indicators
  useEffect(() => {
    filterScrollPos.setValue(0);
    tripTypeScrollPos.setValue(0);
  }, []);

  // Filter drivers when trip type, search query, or dates change
  useEffect(() => {
    let result = ALL_DRIVERS;
    
    // Filter by trip type
    if (selectedTripType) {
      result = result.filter(driver => 
        driver.badges.some(badge => badge.id === selectedTripType)
      );
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
  }, [selectedTripType, searchQuery, startDate, endDate, activeFilter]);

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
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderDriverCard = ({ item }: { item: Driver }) => (
    <TouchableOpacity 
      style={styles.driverCard}
      onPress={() => router.push(`/driver-details?id=${item.id}`)}
    >
      <View style={styles.cardTopSection}>
        <View style={styles.driverLeftSection}>
          <Image source={{ uri: item.image }} style={styles.driverImage} />
        </View>

        <View style={styles.driverInfo}>
          <ThemedText style={styles.driverName}>{item.name}</ThemedText>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{item.rating} • {item.trips} trips</ThemedText>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold" style={styles.priceText}>₹{item.price}</ThemedText>
          <ThemedText style={styles.priceSubtext}>per day</ThemedText>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        {item.badges.map((badge: Badge, index: number) => (
          <View key={index} style={styles.badge}>
            <Ionicons name={badge.icon as any} size={12} color="#1a73e8" style={styles.badgeIcon} />
            <ThemedText style={styles.badgeText}>{badge.name}</ThemedText>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderTripTypeButton = ({ item }: { item: TripType }) => (
    <TouchableOpacity 
      style={[
        styles.tripTypeButton, 
        selectedTripType === item.id && styles.selectedTripType
      ]}
      onPress={() => setSelectedTripType(selectedTripType === item.id ? null : item.id)}
    >
      <Ionicons 
        name={item.icon as any}
        size={24} 
        color={selectedTripType === item.id ? '#FFFFFF' : '#aaaaaa'} 
      />
      <ThemedText 
        style={[
          styles.tripTypeText,
          selectedTripType === item.id && styles.selectedTripTypeText
        ]}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderFilterOption = ({ item }: { item: typeof FILTER_OPTIONS[0] }) => (
    <TouchableOpacity 
      style={[
        styles.filterOption, 
        activeFilter === item.id && styles.activeFilterOption
      ]}
      onPress={() => setActiveFilter(activeFilter === item.id ? null : item.id)}
    >
      <Ionicons 
        name={item.icon as any}
        size={16} 
        color={activeFilter === item.id ? '#FFFFFF' : '#aaaaaa'} 
        style={styles.filterIcon}
      />
      <ThemedText 
        style={[
          styles.filterOptionText,
          activeFilter === item.id && styles.activeFilterOptionText
        ]}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      {/* Status bar spacer to prevent content from scrolling into notification area */}
      <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: '#121212' }} />
      
      <ScrollView
        style={{ backgroundColor: '#121212' }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32
        }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* VAHAKA Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#007AFF', '#0066CC']}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerLogoContainer}>
              <View style={styles.bannerLogoCircle}>
                <ThemedText style={styles.bannerLogoText}>V</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.bannerBrandName}>VAHAKA</ThemedText>
          </LinearGradient>
        </View>
        
        <ThemedView style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#aaaaaa" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for drivers"
              placeholderTextColor="#777777"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </ThemedView>
        
        <ThemedView style={styles.dateFilterContainer}>
          <ThemedText type="subtitle">Select Trip Dates</ThemedText>
          <View style={styles.datePickerRow}>
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4a90e2" style={styles.dateIcon} />
              <ThemedText style={styles.dateText}>
                {startDate ? formatDate(startDate) : "Start Date"}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.datePickerButton,
                !startDate && styles.disabledDatePickerButton
              ]}
              onPress={() => setShowEndDatePicker(true)}
              disabled={!startDate}
            >
              <Ionicons name="calendar-outline" size={20} color={!startDate ? "#ccc" : "#4a90e2"} style={styles.dateIcon} />
              <ThemedText style={[
                styles.dateText, 
                !startDate && styles.disabledDateText
              ]}>
                {endDate ? formatDate(endDate) : "End Date"}
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <DateTimePickerModal
            isVisible={showStartDatePicker}
            mode="date"
            onConfirm={handleConfirmStartDate}
            onCancel={() => setShowStartDatePicker(false)}
            minimumDate={new Date()}
            date={startDate || new Date()}
          />
          
          <DateTimePickerModal
            isVisible={showEndDatePicker}
            mode="date"
            onConfirm={handleConfirmEndDate}
            onCancel={() => setShowEndDatePicker(false)}
            minimumDate={startDate || new Date()}
            date={endDate || startDate || new Date()}
          />
        </ThemedView>
        
        <ThemedView style={styles.filterContainer}>
          <ThemedText type="subtitle">Sort Drivers By</ThemedText>
          <FlatList
            ref={filterListRef}
            data={FILTER_OPTIONS}
            renderItem={renderFilterOption}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterOptionsList}
            onScroll={(event) => {
              const e = event.nativeEvent;
              const contentWidth = e.contentSize.width;
              const layoutWidth = e.layoutMeasurement.width;
              const scrollPos = e.contentOffset.x;
              
              // Check if scrollable
              setIsFilterScrollable(contentWidth > layoutWidth);
              
              // If not scrollable, return early
              if (contentWidth <= layoutWidth) return;
              
              // Calculate position of the scroll indicator
              const maxScrollLeft = contentWidth - layoutWidth;
              const scrollPercentage = scrollPos / maxScrollLeft;
              const maxKnobLeft = layoutWidth - 50; // 50 is knob width
              const knobPosition = Math.max(0, Math.min(maxKnobLeft, scrollPercentage * maxKnobLeft));
              
              Animated.spring(filterScrollPos, {
                toValue: knobPosition,
                useNativeDriver: false,
                friction: 7,
                tension: 40,
                velocity: 10
              }).start();
            }}
            scrollEventThrottle={8}
            decelerationRate="fast"
          />
          <View style={styles.scrollIndicator}>
            <View style={styles.scrollIndicatorLine} />
            <Animated.View style={[styles.scrollIndicatorKnob, { left: filterScrollPos }]} />
          </View>
        </ThemedView>
        
        <ThemedView style={styles.tripTypesContainer}>
          <ThemedText type="subtitle">Select Trip Type</ThemedText>
          <FlatList
            ref={tripTypeListRef}
            data={TRIP_TYPES}
            renderItem={renderTripTypeButton}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripTypesList}
            onScroll={(event) => {
              const e = event.nativeEvent;
              const contentWidth = e.contentSize.width;
              const layoutWidth = e.layoutMeasurement.width;
              const scrollPos = e.contentOffset.x;
              
              // Check if scrollable
              setIsTripTypeScrollable(contentWidth > layoutWidth);
              
              // If not scrollable, return early
              if (contentWidth <= layoutWidth) return;
              
              // Calculate position of the scroll indicator
              const maxScrollLeft = contentWidth - layoutWidth;
              const scrollPercentage = scrollPos / maxScrollLeft;
              const maxKnobLeft = layoutWidth - 50; // 50 is knob width
              const knobPosition = Math.max(0, Math.min(maxKnobLeft, scrollPercentage * maxKnobLeft));
              
              Animated.spring(tripTypeScrollPos, {
                toValue: knobPosition,
                useNativeDriver: false,
                friction: 7,
                tension: 40,
                velocity: 10
              }).start();
            }}
            scrollEventThrottle={8}
            decelerationRate="fast"
          />
          <View style={styles.scrollIndicator}>
            <View style={styles.scrollIndicatorLine} />
            <Animated.View style={[styles.scrollIndicatorKnob, { left: tripTypeScrollPos }]} />
          </View>
        </ThemedView>

        <ThemedView style={styles.driversContainer}>
          <View style={styles.driversHeaderContainer}>
            <ThemedText type="subtitle">Top Rated Drivers</ThemedText>
            <View style={styles.filtersContainer}>
              {selectedTripType && (
                <ThemedText style={styles.filterInfo}>
                  {TRIP_TYPES.find(t => t.id === selectedTripType)?.name}
                </ThemedText>
              )}
              
              {startDate && endDate && (
                <ThemedText style={styles.filterInfo}>
                  {formatDate(startDate).split(',')[0]} - {formatDate(endDate).split(',')[0]}
                </ThemedText>
              )}
            </View>
          </View>
          
          {filteredDrivers.length > 0 ? (
            <FlatList
              data={filteredDrivers}
              renderItem={renderDriverCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#777777" />
              <ThemedText style={styles.noResultsText}>No drivers found</ThemedText>
              <ThemedText style={styles.noResultsSubtext}>
                Try adjusting your filters or search criteria
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
    color: '#aaaaaa',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    gap: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledDatePickerButton: {
    backgroundColor: '#2a2a2a',
    shadowOpacity: 0.05,
  },
  dateIcon: {
    marginRight: 8,
    color: '#007AFF',
  },
  dateText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
  disabledDateText: {
    color: '#666',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterOptionsList: {
    paddingVertical: 8,
    gap: 6,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 120,
  },
  activeFilterOption: {
    backgroundColor: '#007AFF',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterOptionText: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '500',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tripTypesContainer: {
    marginBottom: 16,
  },
  tripTypesList: {
    paddingVertical: 8,
    gap: 6,
  },
  tripTypeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
    width: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTripType: {
    backgroundColor: '#007AFF',
  },
  tripTypeText: {
    marginTop: 4,
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '500',
  },
  selectedTripTypeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  driversContainer: {
    gap: 8,
    paddingBottom: 50,
  },
  driversHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterInfo: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    backgroundColor: '#153450',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  driverCard: {
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 10,
  },
  driverLeftSection: {
    alignItems: 'center',
    marginRight: 16,
    width: 90,
  },
  driverImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#aaaaaa',
    fontWeight: '500',
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  priceText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#aaaaaa',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  badge: {
    backgroundColor: '#153450',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badgeIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginTop: 10,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#cccccc',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollIndicator: {
    height: 4,
    marginVertical: 8,
    position: 'relative',
    width: '100%',
  },
  scrollIndicatorLine: {
    height: 2,
    backgroundColor: '#333333',
    width: '100%',
    borderRadius: 1,
  },
  scrollIndicatorKnob: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4a90e2',
    position: 'absolute',
    top: -1,
    left: 0,
  },
  bannerContainer: {
    marginBottom: 16,
    paddingTop: 20,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerLogoContainer: {
    marginRight: 12,
  },
  bannerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    display: 'flex',
  },
  bannerLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingTop: 5,
  },
  bannerBrandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
    marginRight: 48, // Reduced offset to match smaller logo
  },
});
