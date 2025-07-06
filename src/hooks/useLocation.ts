import { useState, useEffect } from 'react';
import { requestLocation, calculateDistance, calculateSpeed } from '../utils/telegram';

interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
}

interface SpeedData {
  speed: number;
  isViolation: boolean;
}

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<SpeedData>({ speed: 0, isViolation: false });
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const location = await requestLocation();
      if (location) {
        const locationData: LocationData = {
          ...location,
          timestamp: Date.now()
        };
        setCurrentLocation(locationData);
        return location;
      }
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!isTracking) return;

    const trackingInterval = setInterval(async () => {
      const location = await getCurrentLocation();
      if (location) {
        const locationData: LocationData = {
          ...location,
          timestamp: Date.now()
        };

        setLocationHistory(prev => {
          const newHistory = [...prev, locationData];
          
          // Calculate speed if we have previous location
          if (newHistory.length >= 2) {
            const prevLocation = newHistory[newHistory.length - 2];
            const distance = calculateDistance(
              prevLocation.lat,
              prevLocation.lng,
              locationData.lat,
              locationData.lng
            );
            const timeDiff = locationData.timestamp - prevLocation.timestamp;
            const speed = calculateSpeed(distance, timeDiff);
            
            setCurrentSpeed({
              speed,
              isViolation: speed > 27 // 27 km/h limit as per requirements
            });
          }

          // Keep only last 10 locations
          return newHistory.slice(-10);
        });
      }
    }, 5000); // Track every 5 seconds

    return () => clearInterval(trackingInterval);
  }, [isTracking]);

  const isNearLocation = (targetLat: number, targetLng: number, radiusMeters: number = 10): boolean => {
    if (!currentLocation) return false;
    
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      targetLat,
      targetLng
    );
    
    return distance <= radiusMeters;
  };

  return {
    currentLocation,
    currentSpeed,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentLocation,
    isNearLocation,
    locationHistory
  };
};