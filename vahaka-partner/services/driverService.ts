import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Driver } from '../types/driver';

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
}

export const driverService = new DriverService(); 