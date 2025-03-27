import axios from 'axios';

// Base URL for API requests
// For emulators, use: 'http://localhost:3000/api'
// For physical devices, use your computer's IP address: 'http://192.168.x.x:3000/api'
// You can find your IP address using 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
const BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator default
// const BASE_URL = 'http://localhost:3000/api'; // iOS simulator or web
// const BASE_URL = 'http://YOUR_LOCAL_IP:3000/api'; // Physical device (replace YOUR_LOCAL_IP)

// Create axios instance with common configs
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service object with methods for each endpoint
const apiService = {
  // Driver related endpoints
  drivers: {
    // Get all drivers, optionally filtered by trip type
    getAll: async (tripType = '') => {
      try {
        const queryParams = tripType ? `?tripType=${tripType}` : '';
        const response = await api.get(`/drivers${queryParams}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }
    },
    
    // Get a single driver by ID
    getById: async (driverId) => {
      try {
        const response = await api.get(`/drivers/${driverId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching driver with ID ${driverId}:`, error);
        throw error;
      }
    },
    
    // Add a review for a driver
    addReview: async (driverId, reviewData) => {
      try {
        const response = await api.post(`/drivers/${driverId}/reviews`, reviewData);
        return response.data;
      } catch (error) {
        console.error('Error adding review:', error);
        throw error;
      }
    }
  },
  
  // Booking related endpoints
  bookings: {
    // Create a new booking
    create: async (bookingData) => {
      try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    },
    
    // Get all bookings for a user
    getUserBookings: async (userId) => {
      try {
        const response = await api.get(`/users/${userId}/bookings`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
      }
    }
  },
  
  // User related endpoints
  users: {
    // Get user profile
    getProfile: async (userId) => {
      try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
    
    // Add a payment method
    addPaymentMethod: async (userId, paymentData) => {
      try {
        const response = await api.post(`/users/${userId}/payment-methods`, paymentData);
        return response.data;
      } catch (error) {
        console.error('Error adding payment method:', error);
        throw error;
      }
    },
    
    // Set a payment method as default
    setDefaultPaymentMethod: async (userId, paymentId) => {
      try {
        const response = await api.put(`/users/${userId}/payment-methods/${paymentId}/default`);
        return response.data;
      } catch (error) {
        console.error('Error setting default payment method:', error);
        throw error;
      }
    }
  }
};

export default apiService; 