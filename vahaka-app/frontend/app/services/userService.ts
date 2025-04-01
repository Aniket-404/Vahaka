import { getAuth, Auth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, writeBatch, query, where, documentId } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from './firebaseConfig';
import { User, UserProfile, Booking, PaymentMethod } from '../types/user';
import bookingService, { getBooking } from './bookingService';

// Payment method interfaces
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

interface PaymentMethodData {
  type: 'card' | 'upi' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

// Helper function to safely get auth instance
const safeGetAuth = (): Auth => {
  try {
    return auth; // Use the imported auth instance from firebaseConfig
  } catch (error) {
    console.error('Error getting auth instance:', error);
    throw new Error('Firebase authentication is not initialized');
  }
};

/**
 * Get all payment methods for the current user
 */
export const getUserPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    // Use our safe auth instance
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentAuth.currentUser.uid;
    const userDocRef = doc(db, 'users', userId);
    const paymentMethodsCollectionRef = collection(userDocRef, 'paymentMethods');
    const paymentMethodsSnapshot = await getDocs(paymentMethodsCollectionRef);

    const paymentMethods: PaymentMethod[] = [];
    paymentMethodsSnapshot.forEach((doc) => {
      const data = doc.data();
      paymentMethods.push({
        id: doc.id,
        type: data.type,
        name: data.name,
        details: data.details,
        isDefault: data.isDefault || false,
      });
    });

    // Sort payment methods: default first, then by name
    return paymentMethods.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

/**
 * Add a new payment method for the current user
 */
export const addPaymentMethod = async (paymentMethodData: PaymentMethodData): Promise<string> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentAuth.currentUser.uid;
    const userDocRef = doc(db, 'users', userId);
    
    // If this is set as default, update any existing default payment methods
    if (paymentMethodData.isDefault) {
      const paymentMethodsCollectionRef = collection(userDocRef, 'paymentMethods');
      const defaultMethodsQuery = query(
        paymentMethodsCollectionRef,
        where('isDefault', '==', true)
      );
      
      const defaultMethodsSnapshot = await getDocs(defaultMethodsQuery);
      
      // Batch update to remove default status from other payment methods
      const batch = writeBatch(db);
      defaultMethodsSnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { isDefault: false });
      });
      
      await batch.commit();
    }
    
    // Add the new payment method
    const paymentMethodsCollectionRef = collection(userDocRef, 'paymentMethods');
    const newPaymentMethodRef = await addDoc(paymentMethodsCollectionRef, paymentMethodData);
    
    return newPaymentMethodRef.id;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

/**
 * Delete a payment method for the current user
 */
export const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentAuth.currentUser.uid;
    const userDocRef = doc(db, 'users', userId);
    const paymentMethodRef = doc(collection(userDocRef, 'paymentMethods'), paymentMethodId);
    
    // Check if this is a default payment method
    const paymentMethodSnapshot = await getDoc(paymentMethodRef);
    
    if (paymentMethodSnapshot.exists() && paymentMethodSnapshot.data().isDefault) {
      // This was a default payment method, set another one as default if available
      const paymentMethodsCollectionRef = collection(userDocRef, 'paymentMethods');
      const otherMethodsQuery = query(
        paymentMethodsCollectionRef,
        where(documentId(), '!=', paymentMethodId)
      );
      
      const otherMethodsSnapshot = await getDocs(otherMethodsQuery);
      
      if (!otherMethodsSnapshot.empty) {
        // Set the first available method as default
        const firstMethod = otherMethodsSnapshot.docs[0];
        await updateDoc(firstMethod.ref, { isDefault: true });
      }
    }
    
    // Delete the payment method
    await deleteDoc(paymentMethodRef);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

/**
 * Get all bookings for the current user
 */
export const getUserBookings = async (): Promise<Booking[]> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Use bookingService to get bookings for the current user
    return await bookingService.getUserBookings(currentAuth.currentUser.uid);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

/**
 * Upload a profile image for the current user
 */
export const uploadProfileImage = async (imageUri: string): Promise<string> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentAuth.currentUser.uid;
    
    // Create a storage reference
    const storage = getStorage();
    const storageRef = ref(storage, `users/${userId}/profile.jpg`);
    
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Upload the image
    const uploadTask = await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update the user profile
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'profile.profileImage': downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Update the user profile information
 */
export const updateUserProfile = async (profileData: any): Promise<void> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentAuth.currentUser.uid;
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
      'profile.name': profileData.name,
      'profile.email': profileData.email,
      'profile.phone': profileData.phone,
      'profile.address': profileData.address,
      'profile.city': profileData.city,
      'profile.state': profileData.state,
      'profile.postalCode': profileData.postalCode,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Use the named export function getBooking
    const booking = await getBooking(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = auth.currentUser.uid;
    
    // Get the booking
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnapshot = await getDoc(bookingRef);
    
    if (!bookingSnapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingSnapshot.data();
    
    // Verify that this booking belongs to the current user
    if (bookingData.userId !== userId) {
      throw new Error('You do not have permission to cancel this booking');
    }
    
    // Check if booking can be cancelled
    if (bookingData.status.toLowerCase() === 'cancelled') {
      throw new Error('This booking is already cancelled');
    }
    
    if (bookingData.status.toLowerCase() === 'completed') {
      throw new Error('Cannot cancel a completed booking');
    }
    
    // Cancel the booking
    await updateDoc(bookingRef, {
      status: 'Cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'user'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Get the user profile data
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    return {
      name: userData.profile?.name || '',
      email: userData.profile?.email || '',
      phone: userData.profile?.phone || '',
      address: userData.profile?.address || '',
      city: userData.profile?.city || '',
      state: userData.profile?.state || '',
      postalCode: userData.profile?.postalCode || '',
      profileImage: userData.profile?.profileImage || '',
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update an existing payment method
 */
export const updatePaymentMethod = async (paymentMethodId: string, paymentMethodData: PaymentMethodData): Promise<void> => {
  try {
    const currentAuth = safeGetAuth();
    if (!currentAuth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentAuth.currentUser.uid;
    const userDocRef = doc(db, 'users', userId);
    const paymentMethodRef = doc(collection(userDocRef, 'paymentMethods'), paymentMethodId);
    
    // Check if the payment method exists
    const paymentMethodSnapshot = await getDoc(paymentMethodRef);
    if (!paymentMethodSnapshot.exists()) {
      throw new Error('Payment method not found');
    }
    
    // If this is set as default, update any existing default payment methods
    if (paymentMethodData.isDefault && !paymentMethodSnapshot.data().isDefault) {
      const paymentMethodsCollectionRef = collection(userDocRef, 'paymentMethods');
      const defaultMethodsQuery = query(
        paymentMethodsCollectionRef,
        where('isDefault', '==', true)
      );
      
      const defaultMethodsSnapshot = await getDocs(defaultMethodsQuery);
      
      // Batch update to remove default status from other payment methods
      const batch = writeBatch(db);
      defaultMethodsSnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { isDefault: false });
      });
      
      await batch.commit();
    }
    
    // Update the payment method
    await updateDoc(paymentMethodRef, paymentMethodData);
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Default export to satisfy Expo Router
export default () => null; 