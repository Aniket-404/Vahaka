import * as Location from 'expo-location';

// Types for locations
export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  timestamp?: number;
}

// Default location timeouts
const LOCATION_TIMEOUT = 5000; // 5 seconds
const GEOCODING_TIMEOUT = 3000; // 3 seconds

// Default location (Mumbai)
const DEFAULT_LOCATION = {
  latitude: 19.0760,
  longitude: 72.8777,
  city: 'Mumbai',
  timestamp: Date.now()
};

/**
 * Request location permissions from the user
 * @returns True if permissions are granted, false otherwise
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Get the current location of the user with a timeout
 * @param useFallback Whether to use the fallback location if real location cannot be obtained
 * @returns The user's current location or fallback location if useFallback is true
 */
export const getCurrentLocation = async (useFallback = true): Promise<UserLocation | null> => {
  try {
    // Check if permissions are granted
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permissions not granted');
      const permissionGranted = await requestLocationPermissions();
      if (!permissionGranted) {
        console.log('Location permissions denied');
        return useFallback ? DEFAULT_LOCATION : null;
      }
    }
    
    // Get the last known location first (this is fast)
    let location = await Location.getLastKnownPositionAsync();
    
    if (location) {
      console.log('Using last known location');
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      };
    }
    
    // Create a promise race between the location request and a timeout
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low, // Use low accuracy for faster results
    });
    
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('Location request timed out');
        resolve(null);
      }, LOCATION_TIMEOUT);
    });
    
    console.log('Fetching current location...');
    location = await Promise.race([locationPromise, timeoutPromise]);
    
    if (!location) {
      console.log('Location request timed out or failed');
      return useFallback ? DEFAULT_LOCATION : null;
    }
    
    console.log('Location received');
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return useFallback ? DEFAULT_LOCATION : null;
  }
};

/**
 * Reverse geocode a location to get the address with a timeout
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns The address of the location or null if not available or timeout occurs
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    // Check if this is the default location
    if (latitude === DEFAULT_LOCATION.latitude && longitude === DEFAULT_LOCATION.longitude) {
      return 'Mumbai, Maharashtra, India';
    }
    
    console.log('Reverse geocoding location');
    
    // Create a promise race between the geocoding request and a timeout
    const geocodePromise = Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('Geocoding request timed out');
        resolve(null);
      }, GEOCODING_TIMEOUT);
    });
    
    const result = await Promise.race([geocodePromise, timeoutPromise]);
    
    if (!result) {
      console.log('Geocoding timed out');
      return null;
    }
    
    if (result.length > 0) {
      const location = result[0];
      
      // Create a formatted address
      const address = [
        location.name,
        location.street,
        location.district,
        location.city,
        location.region,
        location.country
      ]
        .filter(Boolean)
        .join(', ');
      
      console.log('Geocoded address:', address);
      return address;
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
    return null;
  }
};

/**
 * Get the city name from a location with a timeout
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns The city name or a default value if not available or timeout occurs
 */
export const getCityFromLocation = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    // Check if this is the default location
    if (latitude === DEFAULT_LOCATION.latitude && longitude === DEFAULT_LOCATION.longitude) {
      return DEFAULT_LOCATION.city;
    }
    
    // Create a promise race between the geocoding request and a timeout
    const geocodePromise = Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('City geocoding request timed out');
        resolve(null);
      }, GEOCODING_TIMEOUT);
    });
    
    const result = await Promise.race([geocodePromise, timeoutPromise]);
    
    if (!result) {
      console.log('City geocoding timed out');
      return 'Unknown';
    }
    
    if (result.length > 0) {
      // Return the city name, or district/region if city is not available
      return result[0].city || result[0].district || result[0].region || 'Unknown';
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error getting city from location:', error);
    return 'Unknown';
  }
};

export default {
  getCurrentLocation,
  requestLocationPermissions,
  reverseGeocode,
  getCityFromLocation
}; 