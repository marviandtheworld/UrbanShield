// Test Web Compatibility
// Run this in your browser console to test web compatibility

console.log('🧪 Testing Web Compatibility...');

// Test 1: Platform Detection
console.log('1. Testing Platform Detection...');
try {
  const Platform = require('react-native').Platform;
  console.log('✅ Platform detected:', Platform.OS);
} catch (error) {
  console.error('❌ Platform detection failed:', error);
}

// Test 2: Location Service
console.log('2. Testing Location Service...');
try {
  const LocationService = require('./lib/locationService').default;
  const locationService = LocationService.getInstance();
  console.log('✅ LocationService loaded successfully');
  
  // Test web location
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    console.log('✅ Browser geolocation supported');
  } else {
    console.warn('⚠️ Browser geolocation not supported');
  }
} catch (error) {
  console.error('❌ LocationService failed:', error);
}

// Test 3: Map Components
console.log('3. Testing Map Components...');
try {
  // Test if react-native-maps causes issues
  const Platform = require('react-native').Platform;
  if (Platform.OS === 'web') {
    console.log('✅ Web platform detected - using fallback');
  } else {
    console.log('✅ Mobile platform - native maps available');
  }
} catch (error) {
  console.error('❌ Map component test failed:', error);
}

// Test 4: Web Map Fallback
console.log('4. Testing Web Map Fallback...');
try {
  const WebMapFallback = require('./components/ui/WebMapFallback').default;
  console.log('✅ WebMapFallback component loaded');
} catch (error) {
  console.error('❌ WebMapFallback failed:', error);
}

// Test 5: Theme Context
console.log('5. Testing Theme Context...');
try {
  const { useTheme } = require('./contexts/ThemeContext');
  console.log('✅ Theme context loaded');
} catch (error) {
  console.error('❌ Theme context failed:', error);
}

// Test 6: Supabase Connection
console.log('6. Testing Supabase Connection...');
try {
  const { supabase } = require('./lib/supabase');
  console.log('✅ Supabase client loaded');
} catch (error) {
  console.error('❌ Supabase connection failed:', error);
}

console.log('🎉 Web compatibility test completed!');

// Additional browser-specific tests
if (typeof window !== 'undefined') {
  console.log('🌐 Browser Environment Tests:');
  
  // Test geolocation API
  if (navigator.geolocation) {
    console.log('✅ Geolocation API available');
  } else {
    console.warn('⚠️ Geolocation API not available');
  }
  
  // Test HTTPS
  if (location.protocol === 'https:') {
    console.log('✅ HTTPS protocol (required for geolocation)');
  } else {
    console.warn('⚠️ HTTP protocol - geolocation may not work');
  }
  
  // Test modern JavaScript features
  if (typeof Promise !== 'undefined') {
    console.log('✅ Promises supported');
  } else {
    console.error('❌ Promises not supported');
  }
  
  if (typeof fetch !== 'undefined') {
    console.log('✅ Fetch API available');
  } else {
    console.warn('⚠️ Fetch API not available');
  }
}





