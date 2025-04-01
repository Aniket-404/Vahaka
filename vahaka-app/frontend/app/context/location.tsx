import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserLocation, getCurrentLocation, getCityFromLocation } from '../services/locationService';

// Time before considering the cached location data stale (15 minutes)
const LOCATION_CACHE_TIMEOUT = 15 * 60 * 1000;

interface LocationContextType {
  currentLocation: UserLocation | null;
  currentCity: string | null;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

// Create the context with default values
const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  currentCity: null,
  isLoading: true,
  error: null,
  refreshLocation: async () => {}
});

// Hook to use the location context
export const useLocation = () => useContext(LocationContext);

// Location provider component
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [currentCity, setCurrentCity] = useState<string | null>('Mumbai'); // Default city to prevent empty UI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // Check if the cached location is still valid
  const isCacheValid = (): boolean => {
    if (!lastUpdated) return false;
    const now = Date.now();
    return now - lastUpdated < LOCATION_CACHE_TIMEOUT;
  };

  // Function to fetch the user's current location
  const refreshLocation = async (forceRefresh = false) => {
    // Don't refetch if we already have data and it's still valid, unless forced
    if (currentCity && currentLocation && isCacheValid() && !forceRefresh) {
      console.log('Using cached location data');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the current location with fallback enabled
      const location = await getCurrentLocation(true);
      
      if (location) {
        setCurrentLocation(location);
        setLastUpdated(Date.now());
        
        // Get the city name from the location
        if (location.latitude && location.longitude) {
          const city = await getCityFromLocation(location.latitude, location.longitude);
          if (city) {
            setCurrentCity(city);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setError('Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set default location on mount, then try to get actual location in background
  useEffect(() => {
    // First try to get location in the background without showing loading indicator
    const initializeLocation = async () => {
      try {
        // Start with the default location
        const location = await getCurrentLocation(true);
        
        if (location) {
          setCurrentLocation(location);
          setLastUpdated(Date.now());
          
          if (location.latitude && location.longitude) {
            const city = await getCityFromLocation(location.latitude, location.longitude);
            if (city) {
              setCurrentCity(city);
            }
          }
        }
      } catch (error) {
        console.error('Error in background location fetch:', error);
        // Don't show error to user for background fetch
      }
    };
    
    initializeLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        currentCity,
        isLoading,
        error,
        refreshLocation: () => refreshLocation(true) // Force refresh when user explicitly requests it
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext; 