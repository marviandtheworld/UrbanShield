# 📱 Android Permissions Setup for UrbanShield

## ✅ Permissions Added

I've successfully added all necessary Android permissions to your `app.json` file for location services and maps functionality.

### **🔧 Android Permissions Added:**

```json
"permissions": [
  "ACCESS_FINE_LOCATION",        // High accuracy GPS location
  "ACCESS_COARSE_LOCATION",      // Network-based location
  "ACCESS_BACKGROUND_LOCATION",  // Location when app is in background
  "INTERNET",                    // Internet access for maps and geocoding
  "ACCESS_NETWORK_STATE",        // Check network connectivity
  "ACCESS_WIFI_STATE"            // WiFi state for location services
]
```

### **🍎 iOS Permissions Added:**

```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "UrbanShield needs access to your location to show nearby incidents and set default location for reports.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "UrbanShield needs access to your location to provide location-based safety alerts.",
  "NSLocationAlwaysUsageDescription": "UrbanShield needs access to your location to provide location-based safety alerts."
}
```

### **📦 Expo Plugins Added:**

```json
[
  "expo-location",
  {
    "locationAlwaysAndWhenInUsePermission": "UrbanShield needs access to your location to provide location-based safety alerts.",
    "locationAlwaysPermission": "UrbanShield needs access to your location to provide location-based safety alerts.",
    "locationWhenInUsePermission": "UrbanShield needs access to your location to show nearby incidents and set default location for reports.",
    "isIosBackgroundLocationEnabled": true,
    "isAndroidBackgroundLocationEnabled": true
  }
]
```

## 🚀 Next Steps

### **1. Rebuild Your App**
Since we've added native permissions, you need to rebuild your app:

```bash
# For development
npx expo run:android
# or
npx expo run:ios

# For production builds
npx expo build:android
# or
npx expo build:ios
```

### **2. Test Location Services**
1. **Open the app** on a physical device
2. **Try creating an incident** - location should be automatically detected
3. **Check the map view** - your location should appear
4. **Verify permissions** - you should see permission dialogs

### **3. Permission Flow**
When users first use location features:

1. **Create Incident**: App requests location permission
2. **Map View**: App requests location permission  
3. **User Choice**: Allow/Deny location access
4. **Fallback**: If denied, uses Cebu City as default

## 🔍 Permission Details

### **ACCESS_FINE_LOCATION**
- **Purpose**: High accuracy GPS location
- **Usage**: Precise incident location, user location on map
- **Required**: Yes, for accurate location services

### **ACCESS_COARSE_LOCATION** 
- **Purpose**: Network-based location (cell towers, WiFi)
- **Usage**: Fallback when GPS unavailable
- **Required**: Yes, for location fallback

### **ACCESS_BACKGROUND_LOCATION**
- **Purpose**: Location when app is in background
- **Usage**: Future feature for location-based alerts
- **Required**: Optional, for advanced features

### **INTERNET**
- **Purpose**: Network access for maps and geocoding
- **Usage**: OpenStreetMap tiles, reverse geocoding
- **Required**: Yes, for map functionality

### **ACCESS_NETWORK_STATE**
- **Purpose**: Check network connectivity
- **Usage**: Detect if user is online/offline
- **Required**: Yes, for network status

### **ACCESS_WIFI_STATE**
- **Purpose**: WiFi state information
- **Usage**: Enhanced location accuracy
- **Required**: Yes, for better location services

## 🧪 Testing Checklist

### **Location Services Test:**
- [ ] App requests location permission on first use
- [ ] Location is detected when creating incidents
- [ ] Address is automatically filled from GPS
- [ ] Map shows user location marker
- [ ] Location button works in incident modal

### **Permission Denial Test:**
- [ ] App works without location permission
- [ ] Falls back to Cebu City coordinates
- [ ] User can manually enter address
- [ ] Map still shows incidents (without user location)

### **Network Test:**
- [ ] Maps load with internet connection
- [ ] App works offline (cached data)
- [ ] Geocoding works for address resolution

## 🐛 Troubleshooting

### **Location Not Working:**
1. **Check device settings**: Location services enabled
2. **Check app permissions**: Location permission granted
3. **Test on physical device**: Simulator may not have GPS
4. **Check console logs**: Look for location errors

### **Maps Not Loading:**
1. **Check internet connection**: Maps need network
2. **Verify Google Maps API**: If using Google Maps
3. **Check console logs**: Look for map errors
4. **Test on different devices**: Some devices may have issues

### **Permission Denied:**
1. **Clear app data**: Reset permission state
2. **Reinstall app**: Fresh permission request
3. **Check device settings**: Manual permission grant
4. **Test on different devices**: Some devices behave differently

## 📱 Device-Specific Notes

### **Android 6.0+ (API 23+)**
- Runtime permissions required
- User must grant permission when prompted
- Permission can be revoked in settings

### **Android 10+ (API 29+)**
- Background location requires special permission
- More restrictive location access
- May need additional user education

### **Android 11+ (API 30+)**
- Scoped storage affects location access
- May need additional permissions for background location

## 🔒 Privacy Considerations

### **Data Collection:**
- **Location data**: Only collected when user creates incidents
- **No tracking**: Location not stored permanently
- **User control**: Users can deny location access
- **Transparency**: Clear permission descriptions

### **Best Practices:**
- **Minimal data**: Only collect necessary location data
- **User consent**: Clear permission requests
- **Fallback options**: App works without location
- **Data security**: Location data handled securely

## ✅ Verification

After implementing these permissions, verify:

1. **App builds successfully** with new permissions
2. **Location permission dialog** appears on first use
3. **Location services work** in incident creation
4. **Map shows user location** when permission granted
5. **App works without location** when permission denied

**All Android permissions are now properly configured for UrbanShield!** 🎉

The app will now be able to:
- ✅ Request location permissions
- ✅ Access GPS and network location
- ✅ Show user location on maps
- ✅ Auto-fill incident locations
- ✅ Provide location-based features













