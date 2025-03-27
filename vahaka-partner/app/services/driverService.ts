import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Driver } from '../types/driver';
import { Platform } from 'react-native';

const DRIVERS_COLLECTION = 'drivers';
const TEST_COLLECTION = 'test';

class DriverService {
  private collection = 'drivers';

  async getDriver(driverId: string): Promise<Driver | null> {
    try {
      const docRef = doc(db, this.collection, driverId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Driver;
      }
      return null;
    } catch (error) {
      console.error('Error getting driver:', error);
      throw error;
    }
  }

  async updateDriverAvailability(driverId: string, availability: boolean): Promise<void> {
    try {
      const docRef = doc(db, this.collection, driverId);
      await updateDoc(docRef, { availability });
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  }

  async createTestDocuments() {
    try {
      // Create a test document
      const testDocRef = doc(collection(db, 'test'));
      await setDoc(testDocRef, {
        message: 'Test document',
        timestamp: new Date(),
      });

      // Create a test driver document
      const driverDocRef = doc(collection(db, 'drivers'));
      const driverData: Driver = {
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
  }

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
  }

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
  }

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
  }

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
  }

  // Get all drivers
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, DRIVERS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw error;
    }
  },

  // Delete driver
  deleteDriver: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, DRIVERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  },

  // Get drivers by status
  getDriversByStatus: async (status: Driver['status']): Promise<Driver[]> => {
    try {
      const q = query(collection(db, DRIVERS_COLLECTION), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.error('Error getting drivers by status:', error);
      throw error;
    }
  }
}

export const driverService = new DriverService(); 