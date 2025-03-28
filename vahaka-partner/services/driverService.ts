import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  getFirestore,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Driver } from '../models/Driver';

const DRIVERS_COLLECTION = 'drivers';

export const driverService = {
  /**
   * Get a driver's profile by their ID
   */
  async getDriver(driverId: string): Promise<Driver | null> {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, driverId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Driver;
      } else {
        console.log('No driver found with ID:', driverId);
        return null;
      }
    } catch (error) {
      console.error('Error getting driver:', error);
      throw error;
    }
  },

  /**
   * Create or update a driver's profile
   */
  async createDriver(driverId: string, driverData: Omit<Driver, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, driverId);
      await setDoc(docRef, {
        ...driverData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  },

  /**
   * Update a driver's profile
   */
  async updateDriver(driverId: string, driverData: Partial<Driver>): Promise<void> {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(docRef, {
        ...driverData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  },

  /**
   * Update a driver's availability status
   */
  async updateDriverAvailability(driverId: string, isAvailable: boolean): Promise<void> {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(docRef, {
        availability: isAvailable,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  },

  /**
   * Update a driver's location
   */
  async updateDriverLocation(
    driverId: string, 
    latitude: number, 
    longitude: number
  ): Promise<void> {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(docRef, {
        location: {
          latitude,
          longitude,
          lastUpdated: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  },

  async uploadDriverDocument(
    driverId: string,
    documentType: keyof Driver['documents'],
    file: Blob | Uint8Array | ArrayBuffer
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `drivers/${driverId}/${documentType}_${timestamp}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(driverRef, {
        [`documents.${documentType}`]: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading driver document:', error);
      throw error;
    }
  },

  async uploadProfileImage(
    driverId: string,
    file: Blob | Uint8Array | ArrayBuffer
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `drivers/${driverId}/profile_${timestamp}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(driverRef, {
        profileImage: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  // Test function to create a sample document
  async createTestDocuments() {
    try {
      // Create a test document
      const testCollectionRef = collection(db, 'test');
      const testDocRef = doc(testCollectionRef);
      await setDoc(testDocRef, {
        message: 'Test document',
        timestamp: new Date().toISOString(),
      });

      // Create a test driver document
      const driverCollectionRef = collection(db, DRIVERS_COLLECTION);
      const driverDocRef = doc(driverCollectionRef);
      const driverData: Omit<Driver, 'id'> = {
        name: 'Test Driver',
        phone: '+1234567890',
        email: 'test@example.com',
        experience: 5,
        about: 'Test driver profile',
        status: 'pending',
        rating: 4.5,
        totalTrips: 0,
        availability: false,
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Silver',
          plateNumber: 'TEST123',
        },
        license: {
          number: 'DL123456',
          expiryDate: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: {
          latitude: 0,
          longitude: 0,
          lastUpdated: new Date().toISOString(),
        },
      };
      await setDoc(driverDocRef, driverData);

      return {
        testDocId: testDocRef.id,
        driverDocId: driverDocRef.id,
      };
    } catch (error) {
      console.error('Error creating test documents:', error);
      throw error;
    }
  },

  /**
   * Create or update a driver profile
   */
  async saveDriver(driverId: string, driverData: Partial<Driver>): Promise<void> {
    const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
    const timestamp = new Date();
    
    if (driverData.createdAt === undefined) {
      driverData.createdAt = timestamp;
    }
    
    driverData.updatedAt = timestamp;
    
    try {
      await setDoc(driverRef, driverData, { merge: true });
    } catch (error) {
      console.error('Error saving driver data:', error);
      throw error;
    }
  },

  /**
   * Get a driver by their ID
   */
  async getDriverById(driverId: string): Promise<Driver | null> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      const driverSnap = await getDoc(driverRef);
      
      if (driverSnap.exists()) {
        return { id: driverSnap.id, ...driverSnap.data() } as Driver;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw error;
    }
  },

  /**
   * Update driver's current trip
   */
  async updateDriverCurrentTrip(driverId: string, tripId: string | null): Promise<void> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(driverRef, {
        currentTrip: tripId,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating driver current trip:', error);
      throw error;
    }
  },

  /**
   * Get nearby available drivers
   */
  async getNearbyDrivers(latitude: number, longitude: number, radiusInKm: number): Promise<Driver[]> {
    // This is a simplified version that would need to be expanded with 
    // geolocation queries, potentially using Firestore's GeoPoint or a 
    // separate geolocation service
    try {
      const driversQuery = query(
        collection(db, DRIVERS_COLLECTION),
        where('availability', '==', true),
        where('status', '==', 'approved')
      );
      
      const driversSnapshot = await getDocs(driversQuery);
      const drivers: Driver[] = [];
      
      driversSnapshot.forEach((driverDoc) => {
        const driver = { id: driverDoc.id, ...driverDoc.data() } as Driver;
        
        // Calculate distance (simplified - would need proper haversine formula)
        if (driver.location) {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            driver.location.latitude, 
            driver.location.longitude
          );
          
          if (distance <= radiusInKm) {
            drivers.push(driver);
          }
        }
      });
      
      return drivers;
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
      throw error;
    }
  },

  /**
   * Get all drivers with optional filters
   */
  async getDrivers(options: { status?: string, limit?: number } = {}): Promise<Driver[]> {
    try {
      let driversQuery = collection(db, DRIVERS_COLLECTION);
      let queryConstraints = [];
      
      if (options.status) {
        queryConstraints.push(where('status', '==', options.status));
      }
      
      queryConstraints.push(orderBy('createdAt', 'desc'));
      
      if (options.limit) {
        queryConstraints.push(limit(options.limit));
      }
      
      const queryRef = query(driversQuery, ...queryConstraints);
      const driversSnapshot = await getDocs(queryRef);
      
      return driversSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Driver[];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }
};

/**
 * Calculate distance between two points using the Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI/180);
} 