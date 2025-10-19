import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  latitude: number;
  longitude: number;
  address: string;
  is_verified: boolean;
  is_urgent: boolean;
  created_at: string;
  views: number;
  likes: number;
  comments_count: number;
}

interface MobileMapConditionalProps {
  incidents: Incident[];
  onIncidentSelect?: (incident: Incident) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const MobileMapConditional: React.FC<MobileMapConditionalProps> = ({
  incidents,
  onIncidentSelect,
  userLocation,
  initialRegion
}) => {
  // Return early if not on mobile platform
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Map not available on web platform</Text>
        </View>
      </View>
    );
  }

  // Only import react-native-maps on mobile platforms
  let MapView, Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT;
  
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
  } catch (error) {
    console.warn('React Native Maps not available:', error);
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Map not available</Text>
        </View>
      </View>
    );
  }

  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapProvider, setMapProvider] = useState<'default' | 'google'>('default');
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  const mapRef = useRef<typeof MapView>(null);

  // Fallback colors in case theme context is not available
  const safeColors = {
    background: colors?.background || '#ffffff',
    text: colors?.text || '#000000',
    primary: colors?.primary || '#3b82f6',
    secondary: colors?.secondary || '#6b7280',
    warning: colors?.warning || '#f59e0b',
    card: colors?.card || '#f9fafb',
    border: colors?.border || '#e5e7eb'
  };

  // Default region (Cebu City, Philippines)
  const defaultRegion = {
    latitude: 10.3157,
    longitude: 123.8854,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const region = initialRegion || defaultRegion;

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'safety': '#ef4444',
      'maintenance': '#f59e0b',
      'traffic': '#3b82f6',
      'environment': '#10b981',
      'emergency': '#dc2626',
      'community': '#8b5cf6',
      'other': '#6b7280'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'safety': 'shield',
      'maintenance': 'construct',
      'traffic': 'car',
      'environment': 'leaf',
      'emergency': 'warning',
      'community': 'people',
      'other': 'ellipse'
    };
    return icons[category.toLowerCase()] || icons.other;
  };

  const handleMapPress = () => {
    setShowProviderSelector(false);
  };

  const handleProviderChange = (provider: 'default' | 'google') => {
    setMapProvider(provider);
    setShowProviderSelector(false);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const centerOnIncidents = () => {
    if (incidents.length > 0 && mapRef.current) {
      const latitudes = incidents.map(incident => incident.latitude);
      const longitudes = incidents.map(incident => incident.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = Math.max(maxLat - minLat, 0.01);
      const deltaLng = Math.max(maxLng - minLng, 0.01);
      
      mapRef.current.animateToRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: deltaLat * 1.2,
        longitudeDelta: deltaLng * 1.2,
      }, 1000);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: safeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: safeColors.text }]}>Loading map...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: safeColors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        provider={mapProvider === 'google' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        mapType="standard"
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />
        )}

        {/* Incident Markers */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={incident.title}
            description={incident.description}
            onPress={() => onIncidentSelect?.(incident)}
          >
            <View style={[
              styles.customMarker,
              { backgroundColor: getCategoryColor(incident.category) }
            ]}>
              <Ionicons 
                name={getCategoryIcon(incident.category) as any} 
                size={20} 
                color="#fff" 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={20} color={safeColors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}
          onPress={centerOnIncidents}
        >
          <Ionicons name="list" size={20} color={safeColors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}
          onPress={() => setShowProviderSelector(!showProviderSelector)}
        >
          <Ionicons name="layers" size={20} color={safeColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Provider Selector */}
      {showProviderSelector && (
        <View style={[styles.providerSelector, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}>
          <Text style={[styles.providerTitle, { color: safeColors.text }]}>Map Provider</Text>
          <TouchableOpacity
            style={[styles.providerOption, { backgroundColor: mapProvider === 'default' ? safeColors.primary + '20' : 'transparent' }]}
            onPress={() => handleProviderChange('default')}
          >
            <Ionicons name="map" size={16} color={safeColors.primary} />
            <Text style={[styles.providerText, { color: safeColors.text }]}>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerOption, { backgroundColor: mapProvider === 'google' ? safeColors.primary + '20' : 'transparent' }]}
            onPress={() => handleProviderChange('google')}
          >
            <Ionicons name="logo-google" size={16} color={safeColors.primary} />
            <Text style={[styles.providerText, { color: safeColors.text }]}>Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Legend */}
      <View style={[styles.mapLegend, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}>
        <Text style={[styles.legendTitle, { color: safeColors.text }]}>Incident Categories</Text>
        <View style={styles.legendItems}>
          {['safety', 'maintenance', 'traffic', 'environment', 'emergency', 'community'].map((category) => (
            <View key={category} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getCategoryColor(category) }]} />
              <Text style={[styles.legendText, { color: safeColors.text }]}>{category}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryContainer, { backgroundColor: safeColors.background, borderTopColor: safeColors.border }]}>
        <Text style={[styles.summaryTitle, { color: safeColors.text }]}>
          {incidents.length} incidents reported
        </Text>
        <Text style={[styles.summarySubtitle, { color: safeColors.secondary }]}>
          Tap markers for details
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  providerSelector: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  providerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    gap: 8,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
  },
});

export default MobileMapConditional;
