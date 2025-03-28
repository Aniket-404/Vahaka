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
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Trip } from '../models/Trip';
import { getFirestore } from 'firebase/firestore';
import { driverService } from './driverService';

const TRIPS_COLLECTION = 'trips';

export const tripService = {
  /**
   * Get a trip by ID
   */
  async getTripById(tripId: string): Promise<Trip | null> {
    try {
      const tripRef = doc(db, TRIPS_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (tripSnap.exists()) {
        return { id: tripSnap.id, ...tripSnap.data() } as Trip;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw error;
    }
  },

  /**
   * Accept a trip
   */
  async acceptTrip(tripId: string, driverId: string): Promise<void> {
    try {
      const tripRef = doc(db, TRIPS_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const tripData = tripSnap.data() as Trip;
      
      if (tripData.status !== 'pending') {
        throw new Error(`Trip cannot be accepted. Current status: ${tripData.status}`);
      }
      
      const now = new Date();
      
      await updateDoc(tripRef, {
        driverId,
        status: 'accepted',
        acceptTime: now
      });
      
      // Update driver's current trip
      await driverService.updateDriverCurrentTrip(driverId, tripId);
    } catch (error) {
      console.error('Error accepting trip:', error);
      throw error;
    }
  },

  /**
   * Start a trip (driver has picked up the passenger)
   */
  async startTrip(tripId: string, driverId: string): Promise<void> {
    try {
      const tripRef = doc(db, TRIPS_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const tripData = tripSnap.data() as Trip;
      
      if (tripData.status !== 'accepted' || tripData.driverId !== driverId) {
        throw new Error(`Trip cannot be started. Current status: ${tripData.status}`);
      }
      
      const now = new Date();
      
      await updateDoc(tripRef, {
        status: 'in_progress',
        pickupTime: now
      });
    } catch (error) {
      console.error('Error starting trip:', error);
      throw error;
    }
  },

  /**
   * Complete a trip
   */
  async completeTrip(tripId: string, driverId: string): Promise<void> {
    try {
      const tripRef = doc(db, TRIPS_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const tripData = tripSnap.data() as Trip;
      
      if (tripData.status !== 'in_progress' || tripData.driverId !== driverId) {
        throw new Error(`Trip cannot be completed. Current status: ${tripData.status}`);
      }
      
      const now = new Date();
      
      await updateDoc(tripRef, {
        status: 'completed',
        dropoffTime: now
      });
      
      // Clear driver's current trip
      await driverService.updateDriverCurrentTrip(driverId, null);
    } catch (error) {
      console.error('Error completing trip:', error);
      throw error;
    }
  },

  /**
   * Cancel a trip
   */
  async cancelTrip(tripId: string, cancelledBy: 'driver' | 'passenger', driverId: string, reason?: string): Promise<void> {
    try {
      const tripRef = doc(db, TRIPS_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const tripData = tripSnap.data() as Trip;
      
      if (tripData.status === 'completed' || tripData.status === 'cancelled') {
        throw new Error(`Trip cannot be cancelled. Current status: ${tripData.status}`);
      }
      
      if (cancelledBy === 'driver' && tripData.driverId !== driverId) {
        throw new Error('Driver does not match the assigned driver for this trip');
      }
      
      const now = new Date();
      
      await updateDoc(tripRef, {
        status: 'cancelled',
        cancelTime: now,
        cancelledBy,
        cancellationReason: reason || 'No reason provided'
      });
      
      // Clear driver's current trip if cancelled by driver
      if (cancelledBy === 'driver') {
        await driverService.updateDriverCurrentTrip(driverId, null);
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
      throw error;
    }
  },

  /**
   * Get driver's current trip
   */
  async getDriverCurrentTrip(driverId: string): Promise<Trip | null> {
    try {
      const tripsQuery = query(
        collection(db, TRIPS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', 'in', ['accepted', 'in_progress'])
      );
      
      const tripsSnapshot = await getDocs(tripsQuery);
      
      if (tripsSnapshot.empty) {
        return null;
      }
      
      // Should only be one active trip at a time
      const tripDoc = tripsSnapshot.docs[0];
      return { id: tripDoc.id, ...tripDoc.data() } as Trip;
    } catch (error) {
      console.error('Error fetching driver current trip:', error);
      throw error;
    }
  },

  /**
   * Get driver's trip history
   */
  async getDriverTripHistory(driverId: string, options: { limit?: number, offset?: number } = {}): Promise<Trip[]> {
    try {
      let tripsQuery = query(
        collection(db, TRIPS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', 'in', ['completed', 'cancelled']),
        orderBy('requestTime', 'desc')
      );
      
      if (options.limit) {
        tripsQuery = query(tripsQuery, limit(options.limit));
      }
      
      const tripsSnapshot = await getDocs(tripsQuery);
      
      return tripsSnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Trip[];
    } catch (error) {
      console.error('Error fetching driver trip history:', error);
      throw error;
    }
  },

  /**
   * Get available trips for a driver
   */
  async getAvailableTrips(driverLatitude: number, driverLongitude: number, maxDistance: number = 10): Promise<Trip[]> {
    try {
      const tripsQuery = query(
        collection(db, TRIPS_COLLECTION),
        where('status', '==', 'pending')
      );
      
      const tripsSnapshot = await getDocs(tripsQuery);
      const availableTrips: Trip[] = [];
      
      tripsSnapshot.forEach((tripDoc) => {
        const trip = { id: tripDoc.id, ...tripDoc.data() } as Trip;
        
        // Calculate distance from driver to pickup location
        const pickupLat = trip.pickup.location.latitude;
        const pickupLng = trip.pickup.location.longitude;
        
        const distance = calculateDistance(
          driverLatitude,
          driverLongitude,
          pickupLat,
          pickupLng
        );
        
        if (distance <= maxDistance) {
          availableTrips.push(trip);
        }
      });
      
      // Sort by closest first
      return availableTrips.sort((a, b) => {
        const distanceA = calculateDistance(
          driverLatitude,
          driverLongitude,
          a.pickup.location.latitude,
          a.pickup.location.longitude
        );
        
        const distanceB = calculateDistance(
          driverLatitude,
          driverLongitude,
          b.pickup.location.latitude,
          b.pickup.location.longitude
        );
        
        return distanceA - distanceB;
      });
    } catch (error) {
      console.error('Error fetching available trips:', error);
      throw error;
    }
  },

  /**
   * Get all trips for a driver
   */
  async getDriverTrips(driverId: string): Promise<Trip[]> {
    try {
      const q = query(collection(db, TRIPS_COLLECTION), where('driverId', '==', driverId));
      const querySnapshot = await getDocs(q);
      
      const trips: Trip[] = [];
      querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() } as Trip);
      });
      
      return trips;
    } catch (error) {
      console.error('Error getting driver trips:', error);
      throw error;
    }
  },

  /**
   * Watch for the driver's active trip
   */
  watchDriverActiveTrip(driverId: string, callback: (trip: Trip | null) => void) {
    try {
      const q = query(
        collection(db, TRIPS_COLLECTION), 
        where('driverId', '==', driverId),
        where('status', 'in', ['accepted', 'started'])
      );
      
      return onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          callback(null);
          return;
        }
        
        // Assume only one active trip at a time
        const doc = querySnapshot.docs[0];
        callback({ id: doc.id, ...doc.data() } as Trip);
      });
    } catch (error) {
      console.error('Error watching driver active trip:', error);
      throw error;
    }
  },

  /**
   * Update a trip's status
   */
  async updateTripStatus(tripId: string, status: Trip['status']): Promise<void> {
    try {
      const docRef = doc(db, TRIPS_COLLECTION, tripId);
      
      const updateData: any = {
        status,
        'timestamps.updated': new Date().toISOString(),
      };
      
      // Add status-specific timestamp
      if (status === 'accepted') {
        updateData['timestamps.accepted'] = new Date().toISOString();
      } else if (status === 'started') {
        updateData['timestamps.started'] = new Date().toISOString();
      } else if (status === 'completed') {
        updateData['timestamps.completed'] = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData['timestamps.cancelled'] = new Date().toISOString();
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating trip status:', error);
      throw error;
    }
  },

  async rateTrip(tripId: string, rating: number, feedback?: string): Promise<void> {
    try {
      const tripRef = doc(db, TRIPS_COLLECTION, tripId);
      
      const updateData: any = { rating };
      if (feedback) {
        updateData.feedback = feedback;
      }
      
      await updateDoc(tripRef, updateData);
    } catch (error) {
      console.error('Error rating trip:', error);
      throw error;
    }
  },

  // Test function to create a sample trip document
  async createTestTrip(driverId: string): Promise<string> {
    try {
      const tripCollectionRef = collection(db, TRIPS_COLLECTION);
      const tripDocRef = doc(tripCollectionRef);
      const timestamp = new Date().toISOString();
      
      const tripData: Omit<Trip, 'id'> = {
        driverId,
        customerId: 'test-customer-id',
        status: 'pending',
        pickup: {
          address: '123 Main St, Test City',
          latitude: 40.7128,
          longitude: -74.0060
        },
        dropoff: {
          address: '456 Park Ave, Test City',
          latitude: 40.7580,
          longitude: -73.9855
        },
        distance: 5.2,
        duration: 15,
        fare: 25.50,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        timestamps: {
          requested: timestamp
        },
        vehicleType: 'standard'
      };
      
      await setDoc(tripDocRef, tripData);
      return tripDocRef.id;
    } catch (error) {
      console.error('Error creating test trip:', error);
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