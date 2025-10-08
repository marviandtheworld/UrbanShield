// Test Location Permissions
// Run this in your app to test location functionality

import * as Location from 'expo-location';

export const testLocationPermissions = async () => {
  console.log('🧪 Testing Location Permissions...');
  
  try {
    // Test permission request
    console.log('1. Requesting location permission...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('📍 Permission status:', status);
    
    if (status !== 'granted') {
      console.warn('❌ Location permission denied');
      return false;
    }
    
    // Test location accuracy
    console.log('2. Getting current location...');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    console.log('📍 Location obtained:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date(location.timestamp).toISOString()
    });
    
    // Test reverse geocoding
    console.log('3. Testing reverse geocoding...');
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    
    console.log('🏠 Address resolved:', address[0]);
    
    console.log('✅ All location tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Location test failed:', error);
    return false;
  }
};

export const testLocationService = async () => {
  console.log('🧪 Testing LocationService...');
  
  try {
    const LocationService = require('./lib/locationService').default;
    const locationService = LocationService.getInstance();
    
    // Test permission request
    console.log('1. Testing permission request...');
    const hasPermission = await locationService.requestLocationPermission();
    console.log('📍 Permission granted:', hasPermission);
    
    if (!hasPermission) {
      console.warn('❌ Permission denied, testing fallback...');
      return false;
    }
    
    // Test location with address
    console.log('2. Testing location with address...');
    const result = await locationService.getLocationWithAddress();
    
    if (result.granted && result.location) {
      console.log('📍 Location with address:', result.location);
      console.log('✅ LocationService test passed!');
      return true;
    } else {
      console.error('❌ LocationService failed:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ LocationService test failed:', error);
    return false;
  }
};

// Usage in your app:
// import { testLocationPermissions, testLocationService } from './test-location-permissions';
// 
// // Test in a component
// const handleTestLocation = async () => {
//   const permissionTest = await testLocationPermissions();
//   const serviceTest = await testLocationService();
//   
//   console.log('Permission test:', permissionTest);
//   console.log('Service test:', serviceTest);
// };









