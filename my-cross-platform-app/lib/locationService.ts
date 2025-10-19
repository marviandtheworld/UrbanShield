import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  location?: LocationData;
  error?: string;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      // Web platform doesn't support location permissions the same way
      if (Platform.OS === 'web') {
        return true; // Web will use browser's geolocation API
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation(): Promise<LocationPermissionResult> {
    try {
      // Web platform fallback
      if (Platform.OS === 'web') {
        return this.getWebLocation();
      }

      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return {
          granted: false,
          error: 'Location permission denied'
        };
      }

      // Try to get the most accurate location possible
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
      
      this.currentLocation = locationData;
      console.log('📍 Location obtained:', locationData);
      
      return {
        granted: true,
        location: locationData
      };
    } catch (error) {
      console.error('Location service error:', error);
      return {
        granted: false,
        error: 'Failed to get location'
      };
    }
  }

  /**
   * Web platform location fallback
   */
  private async getWebLocation(): Promise<LocationPermissionResult> {
    try {
      if (!navigator.geolocation) {
        return {
          granted: false,
          error: 'Geolocation not supported by this browser'
        };
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            
            this.currentLocation = locationData;
            console.log('📍 Web location obtained:', locationData);
            
            resolve({
              granted: true,
              location: locationData
            });
          },
          (error) => {
            console.error('Web location error:', error);
            resolve({
              granted: false,
              error: error.message
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 5000
          }
        );
      });
    } catch (error) {
      console.error('Web location service error:', error);
      return {
        granted: false,
        error: 'Failed to get web location'
      };
    }
  }

  /**
   * Get cached location if available
   */
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Reverse geocoding to get address from coordinates
   */
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    // Try primary geocoding service (OpenStreetMap Nominatim)
    try {
      const address = await this.tryNominatimGeocoding(latitude, longitude);
      if (address) return address;
    } catch (error) {
      console.warn('⚠️ Primary geocoding failed, trying fallback:', error);
    }

    // Try fallback geocoding service (Photon)
    try {
      const address = await this.tryPhotonGeocoding(latitude, longitude);
      if (address) return address;
    } catch (error) {
      console.warn('⚠️ Fallback geocoding failed:', error);
    }

    // Return coordinates as fallback
    console.warn('⚠️ All geocoding services failed, using coordinates');
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  /**
   * Try OpenStreetMap Nominatim geocoding
   */
  private async tryNominatimGeocoding(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UrbanShield/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response received');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Format the address nicely
        const address = data.display_name
          .split(',')
          .slice(0, 3) // Take first 3 parts (street, city, country)
          .join(', ')
          .trim();
        
        console.log('🏠 Address resolved via Nominatim:', address);
        return address;
      }
      
      return null;
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      return null;
    }
  }

  /**
   * Try Photon geocoding as fallback
   */
  private async tryPhotonGeocoding(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'UrbanShield/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response received');
      }
      
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        const properties = feature.properties;
        
        if (properties) {
          // Build address from available properties
          const addressParts = [];
          if (properties.name) addressParts.push(properties.name);
          if (properties.city) addressParts.push(properties.city);
          if (properties.country) addressParts.push(properties.country);
          
          if (addressParts.length > 0) {
            const address = addressParts.join(', ');
            console.log('🏠 Address resolved via Photon:', address);
            return address;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Photon geocoding error:', error);
      return null;
    }
  }

  /**
   * Get location with address
   */
  async getLocationWithAddress(): Promise<LocationPermissionResult> {
    const result = await this.getCurrentLocation();
    
    if (result.granted && result.location) {
      try {
        const address = await this.getAddressFromCoordinates(
          result.location.latitude,
          result.location.longitude
        );
        
        return {
          granted: true,
          location: {
            ...result.location,
            address
          }
        };
      } catch (error) {
        console.error('Address resolution error:', error);
        return result; // Return location without address
      }
    }
    
    return result;
  }

  /**
   * Show location permission dialog
   */
  showLocationPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Location Access Required',
        'UrbanShield needs access to your location to:\n\n• Show nearby incidents on the map\n• Set default location for incident reports\n• Provide location-based safety alerts',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Allow Location',
            onPress: async () => {
              const hasPermission = await this.requestLocationPermission();
              resolve(hasPermission);
            }
          }
        ]
      );
    });
  }
}

export default LocationService;
