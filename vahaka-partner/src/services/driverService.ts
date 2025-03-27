import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Driver } from '../types/driver';
import { Platform } from 'react-native';

const DRIVERS_COLLECTION = 'drivers';
const TEST_COLLECTION = 'test';

export const driverService = {
  // Create test documents
  async createTestDocuments() {
    try {
      // Create a test document
      const testDoc = await addDoc(collection(db, TEST_COLLECTION), {
        test: "Hello Firebase!",
        timestamp: new Date(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        }
      });
      console.log("Test document created with ID: ", testDoc.id);

      // Create a sample driver document
      const sampleDriver: Omit<Driver, 'id'> = {
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com",
        experience: 5,
        about: "Professional driver with 5 years of experience",
        status: "pending",
        rating: 0,
        totalTrips: 0,
        availability: true,
        vehicle: {
          make: "Toyota",
          model: "Camry",
          year: "2020",
          color: "Silver",
          plateNumber: "ABC123"
        },
        license: {
          number: "DL123456",
          expiryDate: "2025-12-31"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const driverDoc = await addDoc(collection(db, DRIVERS_COLLECTION), sampleDriver);
      console.log("Sample driver document created with ID: ", driverDoc.id);

      return {
        testDocId: testDoc.id,
        driverDocId: driverDoc.id
      };
    } catch (error) {
      console.error("Error creating test documents: ", error);
      throw error;
    }
  },

  // Create a new driver profile
  async createDriver(driverData: Omit<Driver, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, DRIVERS_COLLECTION), {
        ...driverData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        rating: 0,
        totalTrips: 0,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  },

  // Update an existing driver profile
  async updateDriver(driverId: string, driverData: Partial<Driver>): Promise<void> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(driverRef, {
        ...driverData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  },

  // Get a driver profile by ID
  async getDriver(driverId: string): Promise<Driver | null> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      const driverDoc = await getDoc(driverRef);
      
      if (driverDoc.exists()) {
        return { id: driverDoc.id, ...driverDoc.data() } as Driver;
      }
      return null;
    } catch (error) {
      console.error('Error getting driver:', error);
      throw error;
    }
  },

  // Get all approved drivers
  async getApprovedDrivers(): Promise<Driver[]> {
    try {
      const q = query(
        collection(db, DRIVERS_COLLECTION),
        where('status', '==', 'approved')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
    } catch (error) {
      console.error('Error getting approved drivers:', error);
      throw error;
    }
  },

  // Update driver location
  async updateDriverLocation(driverId: string, location: { latitude: number; longitude: number }): Promise<void> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(driverRef, {
        location: {
          ...location,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  },

  // Update driver availability
  async updateDriverAvailability(driverId: string, isAvailable: boolean): Promise<void> {
    try {
      const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
      await updateDoc(driverRef, {
        availability: isAvailable,
      });
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  },

  // Get all drivers
  async getAllDrivers(): Promise<Driver[]> {
    try {
      const querySnapshot = await getDocs(collection(db, DRIVERS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw error;
    }
  },

  // Delete driver
  async deleteDriver(id: string): Promise<void> {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  },

  // Get drivers by status
  async getDriversByStatus(status: Driver['status']): Promise<Driver[]> {
    try {
      const q = query(collection(db, DRIVERS_COLLECTION), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
    } catch (error) {
      console.error('Error getting drivers by status:', error);
      throw error;
    }
  }
}; 