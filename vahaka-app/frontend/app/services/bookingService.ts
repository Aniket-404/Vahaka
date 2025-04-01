import { db, partnerDb } from './firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  CollectionReference,
  DocumentData,
  Firestore
} from 'firebase/firestore';

// Import the Booking interface from types
import { Booking } from '../types/user';

/**
 * Check if Firestore db is initialized and throw error if not
 */
function ensureFirestore(db: Firestore | null, dbName: string): Firestore {
  if (!db) {
    const error = new Error(`${dbName} Firestore database is not initialized`);
    console.error(error);
    throw error;
  }
  return db;
}

/**
 * Helper function to safely convert a timestamp to a Date
 */
function safeConvertDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  
  if (timestamp?.seconds && timestamp?.nanoseconds) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  return new Date();
}

/**
 * Create a new booking
 */
export async function createBooking(bookingData: Booking): Promise<string> {
  try {
    // Ensure db is initialized
    const firestore = ensureFirestore(db, 'Main');
    
    console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
    
    // Convert dates to Firestore timestamps
    const firestoreData = {
      ...bookingData,
      startDate: Timestamp.fromDate(new Date(bookingData.startDate)),
      endDate: Timestamp.fromDate(new Date(bookingData.endDate)),
      createdAt: Timestamp.fromDate(new Date(bookingData.createdAt || new Date()))
    };

    // Add document to collection
    const bookingsCollection = collection(firestore, 'bookings');
    const docRef = await addDoc(bookingsCollection, firestoreData);
    console.log('Booking created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get all bookings for a specific user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    // Ensure db is initialized
    const firestore = ensureFirestore(db, 'Main');
    const partnerFirestore = ensureFirestore(partnerDb, 'Partner');
    
    const bookingsCollection = collection(firestore, 'bookings');
    const q = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    // Process each booking and fetch additional driver details if needed
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Create booking with safely converted dates
      const booking: Booking = {
        id: docSnapshot.id,
        ...data,
        startDate: safeConvertDate(data.startDate),
        endDate: safeConvertDate(data.endDate),
        createdAt: safeConvertDate(data.createdAt),
        driverName: data.driverName || data.driverDetails?.name || 'Unknown Driver',
        driverImage: data.driverImage || null,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'pending',
        paymentMethod: data.paymentMethod || 'Not specified',
        totalAmount: data.totalAmount || 0,
        location: data.location || 'Not specified', 
        tripType: data.tripType || 'Standard',
      } as Booking;
      
      // If driver details are missing, try to fetch them
      if (booking.driverId && (!booking.driverDetails || !booking.driverName)) {
        try {
          const partnersCollection = collection(partnerFirestore, 'partners');
          const driverRef = doc(partnersCollection, booking.driverId);
          const driverSnap = await getDoc(driverRef);
          
          if (driverSnap.exists()) {
            const driverData = driverSnap.data();
            booking.driverName = driverData.name || 'Unknown Driver';
            booking.driverImage = driverData.image || driverData.profileImage || null;
            
            // Ensure driverDetails is populated
            booking.driverDetails = {
              name: driverData.name || 'Unknown Driver',
              phone: driverData.phone || 'Not available',
              vehicle: driverData.vehicle || 'Not specified'
            };
          }
        } catch (error) {
          console.error(`Error fetching driver details for booking ${booking.id}:`, error);
        }
      }
      
      bookings.push(booking);
    }
    
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

/**
 * Get upcoming bookings for a user
 */
export async function getUpcomingUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookings = await getUserBookings(userId);
    const now = new Date();
    
    return bookings.filter(booking => {
      const endDate = new Date(booking.endDate);
      // Consider bookings that end in the future as upcoming
      return endDate >= now && booking.status !== 'cancelled';
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    throw error;
  }
}

/**
 * Get past bookings for a user
 */
export async function getPastUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookings = await getUserBookings(userId);
    const now = new Date();
    
    return bookings.filter(booking => {
      const endDate = new Date(booking.endDate);
      // Consider bookings that ended in the past or are cancelled as past
      return endDate < now || booking.status === 'cancelled';
    });
  } catch (error) {
    console.error('Error fetching past bookings:', error);
    throw error;
  }
}

/**
 * Get a specific booking by ID
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  try {
    // Ensure db is initialized
    const firestore = ensureFirestore(db, 'Main');
    const partnerFirestore = ensureFirestore(partnerDb, 'Partner');
    
    const bookingsCollection = collection(firestore, 'bookings');
    const bookingRef = doc(bookingsCollection, bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      console.error(`Booking with ID ${bookingId} not found`);
      return null;
    }
    
    const data = bookingSnap.data();
    
    // Create booking with safely converted dates
    const booking: Booking = {
      id: bookingSnap.id,
      ...data,
      startDate: safeConvertDate(data.startDate),
      endDate: safeConvertDate(data.endDate),
      createdAt: safeConvertDate(data.createdAt),
      driverName: data.driverName || data.driverDetails?.name || 'Unknown Driver',
      driverImage: data.driverImage || null,
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus || 'unpaid',
      paymentMethod: data.paymentMethod || 'Not specified',
      totalAmount: data.totalAmount || 0,
    } as Booking;
    
    // If driver details are missing or incomplete, try to fetch them
    if (booking.driverId) {
      try {
        const partnersCollection = collection(partnerFirestore, 'partners');
        const driverRef = doc(partnersCollection, booking.driverId);
        const driverSnap = await getDoc(driverRef);
        
        if (driverSnap.exists()) {
          const driverData = driverSnap.data();
          booking.driverName = driverData.name || 'Unknown Driver';
          booking.driverImage = driverData.image || driverData.profileImage || null;
          
          // Ensure driverDetails is populated
          booking.driverDetails = {
            name: driverData.name || 'Unknown Driver',
            phone: driverData.phone || 'Not available',
            vehicle: driverData.vehicle || 'Not specified'
          };
        } else {
          // Set default driverDetails if driver document doesn't exist
          booking.driverDetails = booking.driverDetails || {
            name: booking.driverName || 'Unknown Driver',
            phone: 'Not available',
            vehicle: 'Not specified'
          };
        }
      } catch (error) {
        console.error('Error fetching driver details:', error);
        // Ensure we have fallback driverDetails
        booking.driverDetails = booking.driverDetails || {
          name: booking.driverName || 'Unknown Driver',
          phone: 'Not available',
          vehicle: 'Not specified'
        };
      }
    }
    
    return booking;
  } catch (error) {
    console.error('Error getting booking:', error);
    throw new Error('Failed to get booking details');
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, cancelReason: string): Promise<void> {
  try {
    // Ensure db is initialized
    const firestore = ensureFirestore(db, 'Main');
    
    const bookingsCollection = collection(firestore, 'bookings');
    const bookingRef = doc(bookingsCollection, bookingId);
    
    // First check if the booking exists and can be cancelled
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }
    
    const bookingData = bookingSnap.data();
    
    // Check if booking is already cancelled
    if (bookingData.status === 'cancelled') {
      throw new Error('This booking is already cancelled');
    }
    
    // Check if booking is already completed
    if (bookingData.status === 'completed') {
      throw new Error('Cannot cancel a completed booking');
    }
    
    // Update booking status
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.now(),
      cancelReason: cancelReason || 'Cancelled by user'
    });
    
    console.log(`Booking ${bookingId} cancelled successfully`);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

// Default export as an empty object for compatibility
export default {
  createBooking,
  getUserBookings,
  getUpcomingUserBookings,
  getPastUserBookings,
  getBooking,
  cancelBooking
}; 