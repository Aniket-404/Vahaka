import { db } from './firebaseConfig';
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
  Timestamp 
} from 'firebase/firestore';

// Import the Booking interface from types
import { Booking } from '../types/user';

/**
 * Service class for handling booking operations
 */
class BookingServiceClass {
  private bookingsCollection = collection(db, 'bookings');

  /**
   * Create a new booking
   */
  async createBooking(bookingData: Booking): Promise<string> {
    try {
      // Convert dates to Firestore timestamps
      const firestoreData = {
        ...bookingData,
        startDate: Timestamp.fromDate(new Date(bookingData.startDate)),
        endDate: Timestamp.fromDate(new Date(bookingData.endDate)),
        createdAt: Timestamp.fromDate(new Date(bookingData.createdAt || new Date()))
      };

      const docRef = await addDoc(this.bookingsCollection, firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific user
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        this.bookingsCollection,
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
          startDate: this.safeConvertDate(data.startDate),
          endDate: this.safeConvertDate(data.endDate),
          createdAt: this.safeConvertDate(data.createdAt),
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
            const driverRef = doc(db, 'drivers', booking.driverId);
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
   * Get a specific booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    try {
      const bookingRef = doc(this.bookingsCollection, bookingId);
      const bookingSnap = await getDoc(bookingRef);
      
      if (!bookingSnap.exists()) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }
      
      const data = bookingSnap.data();
      
      // Create booking with safely converted dates
      const booking: Booking = {
        id: bookingSnap.id,
        ...data,
        startDate: this.safeConvertDate(data.startDate),
        endDate: this.safeConvertDate(data.endDate),
        createdAt: this.safeConvertDate(data.createdAt),
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
          const driverRef = doc(db, 'drivers', booking.driverId);
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
  async cancelBooking(bookingId: string, cancelReason: string): Promise<void> {
    try {
      const bookingRef = doc(this.bookingsCollection, bookingId);
      
      // First check if the booking exists and can be cancelled
      const bookingSnap = await getDoc(bookingRef);
      
      if (!bookingSnap.exists()) {
        throw new Error('Booking not found');
      }
      
      const bookingData = bookingSnap.data();
      
      if (bookingData.status.toLowerCase() === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }
      
      if (bookingData.status.toLowerCase() === 'completed') {
        throw new Error('Cannot cancel a completed booking');
      }
      
      // Update the booking status to cancelled
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelReason,
        cancelledAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error; // Make sure to propagate the error
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    try {
      const docRef = doc(this.bookingsCollection, bookingId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status:`, error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(bookingId: string, paymentStatus: string, paymentMethod?: string): Promise<void> {
    try {
      const docRef = doc(this.bookingsCollection, bookingId);
      const updateData: any = { paymentStatus };

      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating payment status for booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Add review and rating
   */
  async addReview(bookingId: string, rating: number, review: string): Promise<void> {
    try {
      const docRef = doc(this.bookingsCollection, bookingId);
      await updateDoc(docRef, {
        rating,
        review,
        status: 'completed'
      });
    } catch (error) {
      console.error(`Error adding review for booking ${bookingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to safely convert date values from Firestore
   */
  private safeConvertDate(firestoreDate: any): Date {
    if (!firestoreDate) return new Date();
    
    try {
      if (firestoreDate.toDate && typeof firestoreDate.toDate === 'function') {
        return firestoreDate.toDate();
      } else if (firestoreDate instanceof Date) {
        return firestoreDate;
      } else if (typeof firestoreDate === 'string') {
        const date = new Date(firestoreDate);
        return isNaN(date.getTime()) ? new Date() : date;
      }
      return new Date();
    } catch (e) {
      console.error('Date conversion error:', e);
      return new Date();
    }
  }

  /**
   * Get upcoming bookings for a user
   */
  async getUpcomingUserBookings(userId: string): Promise<Booking[]> {
    try {
      const now = new Date();
      const bookings = await this.getUserBookings(userId);

      return bookings.filter(booking => {
        // Convert dates to comparable format
        const startDate = booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate);
        const endDate = booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate);
        
        // Check if the booking is not cancelled and either:
        // 1. Start date is in the future
        // 2. End date is in the future
        // 3. Status is 'confirmed' or 'pending'
        return (
          booking.status.toLowerCase() !== 'cancelled' &&
          (startDate > now || 
           endDate > now || 
           ['confirmed', 'pending'].includes(booking.status.toLowerCase()))
        );
      });
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  }

  /**
   * Get past bookings for a user
   */
  async getPastUserBookings(userId: string): Promise<Booking[]> {
    try {
      const now = new Date();
      const bookings = await this.getUserBookings(userId);

      return bookings.filter(booking =>
        (new Date(booking.endDate) < now ||
        booking.status.toLowerCase() === 'completed' ||
        booking.status.toLowerCase() === 'cancelled') &&
        booking.status.toLowerCase() !== 'pending'
      );
    } catch (error) {
      console.error('Error fetching past bookings:', error);
      throw error;
    }
  }
}

// Create a default instance of the booking service
const bookingService = new BookingServiceClass();

// Export the instance as default
export default bookingService;

// Export individual functions for convenience
export const createBooking = (bookingData: Booking): Promise<string> => {
  return bookingService.createBooking(bookingData);
};

export const getUserBookings = (userId: string): Promise<Booking[]> => {
  return bookingService.getUserBookings(userId);
};

// Export standalone functions for direct component use
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  try {
    if (!bookingId) {
      console.error('getBooking called with empty bookingId');
      return null;
    }
    
    console.log(`Fetching booking details for ID: ${bookingId}`);
    const booking = await bookingService.getBookingById(bookingId);
    console.log(`Successfully fetched booking for ID: ${bookingId}`);
    return booking;
  } catch (error) {
    console.error(`Error in getBooking for ID ${bookingId}:`, error);
    return null;
  }
};

export const cancelBooking = async (bookingId: string, cancelReason: string = 'Cancelled by user'): Promise<void> => {
  try {
    if (!bookingId) {
      throw new Error('cancelBooking called with empty bookingId');
    }
    
    console.log(`Cancelling booking with ID: ${bookingId}, reason: ${cancelReason}`);
    await bookingService.cancelBooking(bookingId, cancelReason);
    console.log(`Successfully cancelled booking with ID: ${bookingId}`);
  } catch (error) {
    console.error(`Error in cancelBooking for ID ${bookingId}:`, error);
    throw error; // Ensure errors are propagated to callers
  }
};

// Additional standalone functions for component use
export const getUpcomingUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    if (!userId) {
      console.error('getUpcomingUserBookings called with empty userId');
      return [];
    }
    
    console.log(`Fetching upcoming bookings for user: ${userId}`);
    const bookings = await bookingService.getUpcomingUserBookings(userId);
    console.log(`Successfully fetched ${bookings.length} upcoming bookings for user: ${userId}`);
    return bookings;
  } catch (error) {
    console.error(`Error in getUpcomingUserBookings for user ${userId}:`, error);
    return [];
  }
};

export const getPastUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    if (!userId) {
      console.error('getPastUserBookings called with empty userId');
      return [];
    }
    
    console.log(`Fetching past bookings for user: ${userId}`);
    const bookings = await bookingService.getPastUserBookings(userId);
    console.log(`Successfully fetched ${bookings.length} past bookings for user: ${userId}`);
    return bookings;
  } catch (error) {
    console.error(`Error in getPastUserBookings for user ${userId}:`, error);
    return [];
  }
}; 