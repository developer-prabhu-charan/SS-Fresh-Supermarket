import { useState, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
}

interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationData | null>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to get location using browser's Geolocation API
      const geolocationResult = await getGeolocation();
      if (geolocationResult) {
        setLocation(geolocationResult);
        setIsLoading(false);
        return geolocationResult;
      }
    } catch (geolocationError) {
      console.warn('Geolocation failed, falling back to IP-based location:', geolocationError);
    }

    try {
      // Fallback to IP-based location lookup
      const ipLocationResult = await getIPLocation();
      if (ipLocationResult) {
        setLocation(ipLocationResult);
        setIsLoading(false);
        return ipLocationResult;
      }
    } catch (ipError) {
      console.error('IP-based location lookup failed:', ipError);
      setError('Unable to determine location');
    }

    setIsLoading(false);
    return null;
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation
  };
};

// Helper function to get location using browser's Geolocation API
const getGeolocation = (): Promise<LocationData | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get city, region, and country
          const addressData = await reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            city: addressData.city || 'Unknown',
            region: addressData.region || 'Unknown',
            country: addressData.country || 'Unknown'
          });
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown'
          });
        }
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      options
    );
  });
};

// Helper function to get location using IP-based lookup
const getIPLocation = async (): Promise<LocationData | null> => {
  try {
    // Try ipapi.co first
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('ipapi.co request failed');
    }
    
    const data = await response.json();
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || 'Unknown',
      region: data.region || data.region_code || 'Unknown',
      country: data.country_name || data.country || 'Unknown'
    };
  } catch (error) {
    console.warn('ipapi.co failed, trying ipinfo.io:', error);
    
    try {
      // Fallback to ipinfo.io
      const response = await fetch('https://ipinfo.io/json');
      if (!response.ok) {
        throw new Error('ipinfo.io request failed');
      }
      
      const data = await response.json();
      
      // Parse the loc field (format: "lat,lng")
      const [latitude, longitude] = data.loc ? data.loc.split(',').map(Number) : [0, 0];
      
      return {
        latitude,
        longitude,
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country || 'Unknown'
      };
    } catch (fallbackError) {
      console.error('Both IP location services failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Helper function for reverse geocoding using OpenStreetMap Nominatim
const reverseGeocode = async (latitude: number, longitude: number): Promise<{
  city: string;
  region: string;
  country: string;
}> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    const address = data.address || {};
    
    return {
      city: address.city || address.town || address.village || address.municipality || 'Unknown',
      region: address.state || address.province || address.region || 'Unknown',
      country: address.country || 'Unknown'
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown'
    };
  }
};
