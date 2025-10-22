# 🗺️ UrbanShield Map Integration Guide

## Overview
This guide will help you set up the complete location services and interactive safety map for UrbanShield.

## ✅ What's Been Implemented

### 1. Location Services
- **Location Permissions**: Automatic permission requests
- **Current Location**: GPS-based location detection
- **Address Resolution**: Reverse geocoding with OpenStreetMap
- **Default Location**: Auto-fills incident location

### 2. Interactive Safety Map
- **OpenStreetMap Integration**: Free, reliable map tiles
- **Incident Pins**: Different icons for each incident type
- **Real-time Updates**: Live incident data
- **User Location**: Shows current position
- **Responsive Design**: Works on all screen sizes

### 3. Incident Categories & Icons
- 🛡️ **Crime** (Red) - Theft, Public Disturbance
- 🔥 **Fire** (Orange) - Fire incidents
- 🚗 **Accident** (Yellow) - Car, Traffic Accidents
- 💧 **Flood** (Blue) - Flooding incidents
- 🌍 **Landslide** (Purple) - Landslide incidents
- 📳 **Earthquake** (Red) - Earthquake incidents
- ⚪ **Other** (Gray) - Other incidents

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install react-native-maps @react-native-community/geolocation react-native-geolocation-service
```

### Step 2: Platform Configuration

#### Android Setup
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS Setup
Add to `ios/UrbanShield/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>UrbanShield needs access to your location to show nearby incidents and set default location for reports.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>UrbanShield needs access to your location to provide location-based safety alerts.</string>
```

### Step 3: Google Maps API (Optional)
For better performance, add Google Maps API key:

#### Android
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

#### iOS
Add to `ios/UrbanShield/AppDelegate.m`:
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
  // ... existing code
}
```

## 🎯 Features

### Location Services
- **Automatic Location Detection**: Gets user's current location
- **Permission Handling**: User-friendly permission requests
- **Address Resolution**: Converts coordinates to readable addresses
- **Fallback Location**: Uses Cebu City as default if location unavailable

### Interactive Map
- **Incident Visualization**: All incidents displayed as pins
- **Category-based Icons**: Different icons for each incident type
- **Severity Indicators**: Color-coded by severity level
- **Verification Badges**: Green border for verified incidents
- **Urgent Indicators**: Flash icon for urgent incidents

### Map Controls
- **Center on User**: Button to center map on user location
- **Refresh Data**: Button to reload incidents
- **Legend**: Shows incident type colors
- **Dark Mode**: Automatic dark/light theme switching

## 🔧 Usage

### In CreateIncidentModal
```typescript
// Location is automatically detected and set as default
// User can edit the address field if needed
// Location coordinates are saved to database
```

### In SafetyMap Component
```typescript
<SafetyMap
  onIncidentSelect={(incident) => {
    // Handle incident selection
    console.log('Selected incident:', incident);
  }}
  showUserLocation={true}
  initialRegion={{
    latitude: 10.3157,
    longitude: 123.8854,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
/>
```

## 🎨 Customization

### Map Styling
Edit `lib/mapConfig.ts` to customize:
- Map colors and themes
- Category colors
- Icon mappings
- Default regions

### Incident Icons
Modify `getCategoryIcon()` in `SafetyMap.tsx`:
```typescript
const getCategoryIcon = (category: string) => {
  const iconMap = {
    'crime': 'shield',
    'fire': 'flame',
    // ... add more icons
  };
  return iconMap[category] || 'ellipsis-horizontal';
};
```

## 🐛 Troubleshooting

### Location Not Working
1. Check permissions in device settings
2. Ensure GPS is enabled
3. Test in a location with good signal
4. Check console for error messages

### Map Not Loading
1. Verify internet connection
2. Check Google Maps API key (if using)
3. Ensure react-native-maps is properly linked
4. Test on physical device (not simulator)

### Incidents Not Showing
1. Check database connection
2. Verify RPC function exists
3. Check console for fetch errors
4. Ensure incidents have valid coordinates

## 📱 Testing

### Test Location Services
1. Open incident creation modal
2. Check if location is automatically detected
3. Verify address is populated
4. Test location button functionality

### Test Map Features
1. Navigate to map view
2. Check if incidents appear as pins
3. Test pin interactions
4. Verify user location marker
5. Test map controls

## 🚀 Next Steps

### Potential Enhancements
1. **Clustering**: Group nearby incidents
2. **Heat Maps**: Show incident density
3. **Route Planning**: Safe route suggestions
4. **Offline Maps**: Cache map tiles
5. **Real-time Updates**: WebSocket integration
6. **Incident Details**: Full-screen incident view
7. **Search**: Find incidents by location
8. **Filters**: Filter by category/severity

### Performance Optimization
1. **Lazy Loading**: Load incidents as needed
2. **Caching**: Cache map tiles and data
3. **Debouncing**: Limit API calls
4. **Virtualization**: Handle large datasets

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Test on a physical device
4. Check platform-specific configurations

The map integration is now complete and ready for use! 🎉









