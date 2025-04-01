import { partnerDb } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, query, where, orderBy, limit, DocumentData, CollectionReference } from 'firebase/firestore';

// Helper function to map trip types to icon names
function getBadgeIcon(tripType: string): string {
  switch (tripType.toLowerCase()) {
    case 'urgent':
      return 'flash';
    case 'outstation':
      return 'car-sport';
    case 'business':
      return 'briefcase';
    case 'weekly':
      return 'calendar';
    default:
      return 'star';
  }
}

// Driver interface
interface Driver {
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
  }>;
  description?: string;
  languages?: string[];
  vehicle?: string | any;
  vehicleImage?: string;
  reviews?: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  experience?: number;
  status?: string;
  phoneNumber?: string;
  email?: string;
  location?: any;
  license?: any;
  preferences?: any;
  vehicleDetails?: any;
  tripType?: string;
}

// Mock data to use if Firestore isn't working
const MOCK_DRIVERS: Driver[] = [
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
    ],
    description: 'Professional driver with 5 years of experience in business travel.',
    languages: ['English', 'Hindi', 'Marathi'],
    vehicle: {
      make: 'Toyota',
      model: 'Innova',
      color: 'White',
      plateNumber: 'MH-01-AB-1234'
    },
    vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
    reviews: [
      {
        id: '101',
        user: 'Amit Kumar',
        rating: 5,
        comment: 'Very professional and punctual.',
        date: '2023-10-15'
      },
      {
        id: '102',
        user: 'Priya Singh',
        rating: 4.5,
        comment: 'Good driving, knows the city well.',
        date: '2023-11-05'
      }
    ],
    experience: 5,
    status: 'Available',
    phoneNumber: '+91 9876543210',
    email: 'john.doe@example.com'
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    rating: 4.9,
    trips: 85,
    price: 1500,
    image: 'https://randomuser.me/api/portraits/men/44.jpg',
    badges: [
      { id: '3', name: 'Weekly', icon: 'calendar' },
      { id: '1', name: 'Business', icon: 'briefcase' }
    ],
    description: 'Experienced driver specializing in corporate travel.',
    languages: ['English', 'Hindi', 'Gujarati'],
    vehicle: {
      make: 'Honda',
      model: 'City',
      color: 'Silver',
      plateNumber: 'MH-02-CD-5678'
    },
    vehicleImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537',
    reviews: [
      {
        id: '103',
        user: 'Rajesh Patel',
        rating: 5,
        comment: 'Very comfortable drive and excellent service.',
        date: '2023-12-01'
      }
    ],
    experience: 7,
    status: 'Available',
    phoneNumber: '+91 9876543211',
    email: 'rahul.sharma@example.com'
  },
  {
    id: '3',
    name: 'Priya Desai',
    rating: 4.7,
    trips: 150,
    price: 1100,
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    badges: [
      { id: '4', name: 'Urgent', icon: 'flash' },
      { id: '2', name: 'Outstation', icon: 'car-sport' }
    ],
    description: 'Reliable driver with extensive outstation experience.',
    languages: ['English', 'Hindi', 'Marathi'],
    vehicle: {
      make: 'Maruti',
      model: 'Swift Dzire',
      color: 'Blue',
      plateNumber: 'MH-03-EF-9012'
    },
    vehicleImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24',
    reviews: [
      {
        id: '104',
        user: 'Sanjay Mehta',
        rating: 4.5,
        comment: 'Great for long distance travel. Very knowledgeable.',
        date: '2023-11-22'
      },
      {
        id: '105',
        user: 'Anita Reddy',
        rating: 4.8,
        comment: 'Excellent driving skills and very punctual.',
        date: '2023-12-15'
      }
    ],
    experience: 4,
    status: 'Available',
    phoneNumber: '+91 9876543212',
    email: 'priya.desai@example.com'
  }
];

class DriverService {
  private partnersCollection: CollectionReference;
  private useMockData = true; // Set to true as fallback in case Firestore isn't initialized

  constructor() {
    // Check if partnerDb is not null before creating the collection reference
    if (partnerDb) {
      this.partnersCollection = collection(partnerDb, 'partners');
      this.useMockData = false; // Use real data since Firestore is available
    } else {
      console.warn('Partner Firestore database is not initialized. Using mock data instead.');
      // Create a placeholder collection reference that won't be used
      // This is just to satisfy TypeScript
      this.partnersCollection = null as unknown as CollectionReference;
      this.useMockData = true;
    }
  }

  /**
   * Get all drivers from Firestore partners collection
   */
  async getAllDrivers(): Promise<Driver[]> {
    // If Firestore isn't initialized, use mock data
    if (this.useMockData) {
      console.warn('Using mock driver data instead of Firestore');
      return MOCK_DRIVERS;
    }

    try {
      console.log('Fetching all partners from Firestore...');
      const querySnapshot = await getDocs(this.partnersCollection);
      
      console.log(`Found ${querySnapshot.docs.length} partners documents`);
      
      // If no results from Firestore, show an error but don't use mock data
      if (querySnapshot.docs.length === 0) {
        console.error('No data found in Firestore partners collection');
        return [];
      }
      
      const drivers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Improved logging to show the nested structure
        console.log(`Partner document ${doc.id} data:`, JSON.stringify(data, null, 2));
        console.log(`Partner ${doc.id} structure:`, {
          'has profile': !!data.profile, 
          'has vehicle': !!data.vehicle,
          'has preferences': !!data.preferences,
          'has auth': !!data.auth,
          'tripTypes': data.preferences?.tripTypes
        });
        
        // Map Firestore data to driver object
        return this.mapPartnerToDriver(doc.id, data);
      });
      
      console.log('Processed drivers data:', drivers.map(d => ({ 
        id: d.id, 
        name: d.name,
        hasVehicle: d.vehicle ? 'yes' : 'no',
        hasBadges: d.badges && d.badges.length > 0 ? 'yes' : 'no'
      })));
      return drivers;
    } catch (error) {
      console.error('Error fetching partners:', error);
      return this.useMockData ? MOCK_DRIVERS : []; // Fall back to mock data if needed
    }
  }

  /**
   * Get driver by ID from partners collection
   */
  async getDriverById(id: string): Promise<Driver | null> {
    // If Firestore isn't initialized, use mock data
    if (this.useMockData) {
      console.warn('Using mock driver data instead of Firestore');
      const mockDriver = MOCK_DRIVERS.find(driver => driver.id === id);
      return mockDriver || null;
    }

    try {
      console.log(`Fetching partner with ID: ${id}`);
      const docRef = doc(this.partnersCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error(`Partner with ID ${id} not found`);
        return null;
      }
      
      const data = docSnap.data();
      
      // Improved logging to show the nested structure
      console.log(`Partner document ${docSnap.id} data:`, JSON.stringify(data, null, 2));
      console.log(`Partner ${docSnap.id} structure:`, {
        'has profile': !!data.profile, 
        'has vehicle': !!data.vehicle,
        'has preferences': !!data.preferences,
        'has auth': !!data.auth,
        'tripTypes': data.preferences?.tripTypes
      });
      
      // Map Firestore data to driver object
      return this.mapPartnerToDriver(docSnap.id, data);
    } catch (error) {
      console.error(`Error fetching partner with ID ${id}:`, error);
      
      // If using Firestore but an error occurred, check if a mock driver with this ID exists
      if (this.useMockData) {
        const mockDriver = MOCK_DRIVERS.find(driver => driver.id === id);
        return mockDriver || null;
      }
      
      return null;
    }
  }

  /**
   * Helper method to map the partner document data to the Driver interface
   */
  private mapPartnerToDriver(id: string, data: any): Driver {
    // Debug log all relevant fields before mapping
    console.log('Partner data fields for mapping:', {
      'profile.rating': data.profile?.rating,
      'rating': data.rating,
      'profile.totalTrips': data.profile?.totalTrips,
      'trips': data.trips,
      'profile.experience': data.profile?.experience,
      'experience': data.experience
    });

    return {
      id: id,
      // Map nested fields from the partners collection structure
      name: data.profile?.name || data.name || 'Unknown Driver',
      
      // Fix rating field mapping with proper type handling
      rating: this.getNumberValue([
        data.profile?.rating, 
        data.rating, 
        data.profile?.driverRating, 
        data.driverRating
      ], 4.5),
      
      // Fix trips field mapping with proper type handling
      trips: this.getNumberValue([
        data.profile?.totalTrips, 
        data.profile?.trips, 
        data.trips, 
        data.tripCount, 
        data.completedTrips
      ], 0),
      
      price: this.getNumberValue([
        data.preferences?.pricePerDay, 
        data.price, 
        data.rate, 
        data.dailyRate
      ], 1000),
      
      image: data.profile?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg',
      vehicleImage: 'https://images.unsplash.com/photo-1548538134-caf489c8e2d7', // Default vehicle image
      vehicle: data.vehicle || 'Vehicle not specified',
      
      // Create badges from tripTypes array in preferences
      badges: data.preferences?.tripTypes?.map((type: string, index: number) => ({
        id: index.toString(),
        name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
        icon: getBadgeIcon(type)
      })) || [],
      
      // Fix description field mapping to include more potential field names
      description: data.profile?.about || data.profile?.bio || data.profile?.description || data.about || data.bio || data.description || '',
      
      // Fix experience field mapping with proper type handling
      experience: this.getNumberValue([
        data.profile?.experience, 
        data.experience, 
        data.yearsOfExperience
      ], 1),
      
      phoneNumber: data.auth?.phone || '',
      email: data.auth?.email || '',
      status: data.profile?.status || data.status?.isOnline ? 'Available' : 'Unavailable',
      
      // Create empty reviews array for compatibility
      reviews: [],
    } as Driver;
  }

  /**
   * Helper method to get a numeric value from a list of potential sources
   * Returns the first valid number or the default value
   */
  private getNumberValue(sources: any[], defaultValue: number): number {
    for (const source of sources) {
      // Check if the source exists and is a valid number
      if (source !== undefined && source !== null) {
        const num = Number(source);
        if (!isNaN(num)) {
          return num;
        }
      }
    }
    return defaultValue;
  }

  /**
   * Get drivers by trip type from partners collection
   */
  async getDriversByTripType(tripType: string): Promise<Driver[]> {
    try {
      // Use mock data for testing if enabled
      if (this.useMockData) {
        console.log('Using mock data instead of Firestore');
        // Find the badge name that matches the trip type
        const filteredDrivers = MOCK_DRIVERS.filter(driver => 
          driver.badges && 
          driver.badges.some(badge => badge.name.toLowerCase() === tripType.toLowerCase())
        );
        return filteredDrivers.length > 0 ? filteredDrivers : MOCK_DRIVERS;
      }
      
      console.log(`Fetching partners with trip type: ${tripType}`);
      // Try multiple field names that might contain the trip type
      const queries = [
        query(this.partnersCollection, where('tripType', '==', tripType)),
        query(this.partnersCollection, where('specialization', '==', tripType))
      ];
      
      // Combine results from both queries
      let allResults: DocumentData[] = [];
      for (const q of queries) {
        const querySnapshot = await getDocs(q);
        allResults = [...allResults, ...querySnapshot.docs];
      }
      
      console.log(`Found ${allResults.length} partners with trip type ${tripType}`);
      
      // If no results from Firestore, use mock data
      if (allResults.length === 0) {
        console.log('No data found in Firestore, using mock data');
        const filteredDrivers = MOCK_DRIVERS.filter(driver => 
          driver.badges && 
          driver.badges.some(badge => badge.name.toLowerCase() === tripType.toLowerCase())
        );
        return filteredDrivers.length > 0 ? filteredDrivers : MOCK_DRIVERS;
      }
      
      // Remove duplicates based on document ID
      const uniqueResults = Array.from(
        new Map(allResults.map(doc => [doc.id, doc])).values()
      );
      
      const drivers = uniqueResults.map(doc => {
        const data = doc.data();
        
        // Improved logging to show the nested structure
        console.log(`Partner document ${doc.id} data:`, JSON.stringify(data, null, 2));
        console.log(`Partner ${doc.id} structure:`, {
          'has profile': !!data.profile, 
          'has vehicle': !!data.vehicle,
          'has preferences': !!data.preferences,
          'has auth': !!data.auth,
          'tripTypes': data.preferences?.tripTypes
        });
        
        // Map Firestore data to driver object, supporting different possible field names
        return {
          id: doc.id,
          // Primary fields with fallbacks
          name: data.fullName || data.name || data.displayName || 'Unknown Driver',
          rating: data.rating || data.driverRating || 4.5,
          trips: data.trips || data.tripCount || data.completedTrips || 0,
          price: data.price || data.rate || data.dailyRate || 1000,
          
          // Images with fallbacks
          image: data.profilePic || data.image || data.photoURL || data.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          vehicleImage: data.vehicleImage || data.carImage || 'https://images.unsplash.com/photo-1548538134-caf489c8e2d7',
          
          // Optional fields
          description: data.description || data.bio || data.about || '',
          experience: data.experience || data.yearsOfExperience || 1,
          status: data.status || data.availability || 'Available',
          phoneNumber: data.phoneNumber || data.phone || data.mobile || '',
          email: data.email || '',
          
          // Arrays with fallbacks
          badges: data.badges || data.tripTypes || [],
          languages: data.languages || data.languagesSpoken || [],
          reviews: data.reviews || [],
          
          // Vehicle information
          vehicle: data.vehicle || data.vehicleDetails || 'Vehicle not specified',
          
          // Other fields
          location: data.location || data.address || {},
          license: data.license || data.drivingLicense || {},
          preferences: data.preferences || {},
          tripType: data.tripType || data.specialization || '',
          
          // Include all original data to ensure we don't miss anything
          ...data
        } as Driver;
      });
      
      console.log('Processed drivers data:', drivers.map(d => ({ id: d.id, name: d.name })));
      return drivers;
    } catch (error) {
      console.error(`Error fetching partners by trip type ${tripType}:`, error);
      // Return mock data in case of error
      console.log('Using mock data due to error');
      const filteredDrivers = MOCK_DRIVERS.filter(driver => 
        driver.badges && 
        driver.badges.some(badge => badge.name.toLowerCase() === tripType.toLowerCase())
      );
      return filteredDrivers.length > 0 ? filteredDrivers : MOCK_DRIVERS;
    }
  }

  /**
   * Get top rated drivers from partners collection
   */
  async getTopRatedDrivers(limitCount = 5): Promise<Driver[]> {
    try {
      // Use mock data for testing if enabled
      if (this.useMockData) {
        console.log('Using mock data instead of Firestore');
        // Sort by rating and return top results
        return [...MOCK_DRIVERS].sort((a, b) => b.rating - a.rating).slice(0, limitCount);
      }
      
      console.log(`Fetching top ${limitCount} rated partners`);
      
      // Try both possible rating field names
      const queries = [
        query(this.partnersCollection, orderBy('rating', 'desc'), limit(limitCount)),
        query(this.partnersCollection, orderBy('driverRating', 'desc'), limit(limitCount))
      ];
      
      // Combine results from both queries
      let allResults: DocumentData[] = [];
      for (const q of queries) {
        const querySnapshot = await getDocs(q);
        allResults = [...allResults, ...querySnapshot.docs];
      }
      
      console.log(`Found ${allResults.length} top rated partners`);
      
      // If no results from Firestore, use mock data
      if (allResults.length === 0) {
        console.log('No data found in Firestore, using mock data');
        return [...MOCK_DRIVERS].sort((a, b) => b.rating - a.rating).slice(0, limitCount);
      }
      
      // Remove duplicates based on document ID and take only the requested limit
      const uniqueResults = Array.from(
        new Map(allResults.map(doc => [doc.id, doc])).values()
      ).slice(0, limitCount);
      
      const drivers = uniqueResults.map(doc => {
        const data = doc.data();
        
        // Improved logging to show the nested structure
        console.log(`Partner document ${doc.id} data:`, JSON.stringify(data, null, 2));
        console.log(`Partner ${doc.id} structure:`, {
          'has profile': !!data.profile, 
          'has vehicle': !!data.vehicle,
          'has preferences': !!data.preferences,
          'has auth': !!data.auth,
          'tripTypes': data.preferences?.tripTypes
        });
        
        // Map Firestore data to driver object, supporting different possible field names
        return {
          id: doc.id,
          // Primary fields with fallbacks
          name: data.fullName || data.name || data.displayName || 'Unknown Driver',
          rating: data.rating || data.driverRating || 4.5,
          trips: data.trips || data.tripCount || data.completedTrips || 0,
          price: data.price || data.rate || data.dailyRate || 1000,
          
          // Images with fallbacks
          image: data.profilePic || data.image || data.photoURL || data.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          vehicleImage: data.vehicleImage || data.carImage || 'https://images.unsplash.com/photo-1548538134-caf489c8e2d7',
          
          // Optional fields
          description: data.description || data.bio || data.about || '',
          experience: data.experience || data.yearsOfExperience || 1,
          status: data.status || data.availability || 'Available',
          phoneNumber: data.phoneNumber || data.phone || data.mobile || '',
          email: data.email || '',
          
          // Arrays with fallbacks
          badges: data.badges || data.tripTypes || [],
          languages: data.languages || data.languagesSpoken || [],
          reviews: data.reviews || [],
          
          // Vehicle information
          vehicle: data.vehicle || data.vehicleDetails || 'Vehicle not specified',
          
          // Other fields
          location: data.location || data.address || {},
          license: data.license || data.drivingLicense || {},
          preferences: data.preferences || {},
          tripType: data.tripType || data.specialization || '',
          
          // Include all original data to ensure we don't miss anything
          ...data
        } as Driver;
      });
      
      console.log('Processed top rated drivers data:', drivers.map(d => ({ id: d.id, name: d.name, rating: d.rating })));
      return drivers;
    } catch (error) {
      console.error('Error fetching top rated partners:', error);
      // Return mock data in case of error
      console.log('Using mock data due to error');
      return [...MOCK_DRIVERS].sort((a, b) => b.rating - a.rating).slice(0, limitCount);
    }
  }
}

export default new DriverService(); 