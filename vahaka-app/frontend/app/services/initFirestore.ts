import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Initialize essential Firestore collections and documents
 * This ensures our collections exist and are set up correctly
 */
export const initializeFirestore = async (): Promise<void> => {
  console.log('Initializing Firestore collections...');
  
  try {
    // Check if db is initialized
    if (!db) {
      console.error('Cannot initialize Firestore collections: db is null');
      return;
    }
    
    // Create a test document in bookings collection to ensure it exists
    const bookingsCollection = collection(db, 'bookings');
    const testDocRef = doc(bookingsCollection, '__init');
    
    // Check if the document already exists
    const testDoc = await getDoc(testDocRef);
    
    if (!testDoc.exists()) {
      // Create a test document with initialization data
      await setDoc(testDocRef, {
        initialized: true,
        timestamp: new Date().toISOString(),
        message: 'Bookings collection initialized successfully'
      });
      console.log('Bookings collection initialized');
    } else {
      console.log('Bookings collection already exists');
    }
    
    // Initialize other collections as needed
    // const paymentsCollection = collection(db, 'payments');
    // const testPaymentDocRef = doc(paymentsCollection, '__init');
    // ...etc
    
    console.log('Firestore collections initialization completed');
    return;
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
    // Don't throw, just log the error and continue
    return;
  }
};

export default initializeFirestore; 