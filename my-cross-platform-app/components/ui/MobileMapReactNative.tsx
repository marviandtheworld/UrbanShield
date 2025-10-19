import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// This file contains the actual React Native Maps implementation
// It should only be imported on mobile platforms

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

interface MobileMapReactNativeProps {
  incidents: Incident[];
  onIncidentSelect?: (incident: Incident) => void;
  userLocation?: { latitude: number; longitude: number };
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const MobileMapReactNative: React.FC<MobileMapReactNativeProps> = ({
  incidents,
  onIncidentSelect,
  userLocation,
  initialRegion
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

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

  const currentRegion = initialRegion || defaultRegion;

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'crime': 'shield',
      'fire': 'flame',
      'accident': 'car',
      'flood': 'water',
      'landslide': 'earth',
      'earthquake': 'pulse',
      'other': 'ellipsis-horizontal'
    };
    return iconMap[category] || 'ellipsis-horizontal';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'crime': '#ef4444',
      'fire': '#ff6b35',
      'accident': '#f59e0b',
      'flood': '#3b82f6',
      'landslide': '#8b5cf6',
      'earthquake': '#dc2626',
      'other': '#737373'
    };
    return colorMap[category] || '#737373';
  };

  const handleIncidentPress = (incident: Incident) => {
    if (onIncidentSelect) {
      onIncidentSelect(incident);
    }
  };

  const centerOnUserLocation = () => {
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
      const latitudes = incidents.map(incident => incident.latitude).filter(lat => lat !== 0);
      const longitudes = incidents.map(incident => incident.longitude).filter(lng => lng !== 0);
      
      if (latitudes.length > 0 && longitudes.length > 0) {
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
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: safeColors.background }]}>
        <Ionicons name="map" size={48} color={safeColors.primary} />
        <Text style={[styles.loadingText, { color: safeColors.text }]}>Loading map...</Text>
      </View>
    );
  }

  // This is a placeholder - the actual MapView implementation would go here
  // when react-native-maps is properly loaded
  return (
    <View style={[styles.container, { backgroundColor: safeColors.background }]}>
      <View style={styles.mapContainer}>
        <View style={[styles.mapPlaceholder, { backgroundColor: safeColors.card }]}>
          <Ionicons name="map" size={48} color={safeColors.primary} />
          <Text style={[styles.placeholderTitle, { color: safeColors.text }]}>
            React Native Maps
          </Text>
          <Text style={[styles.placeholderSubtitle, { color: safeColors.secondary }]}>
            {incidents.length} incidents loaded
          </Text>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          {userLocation && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: safeColors.card }]}
              onPress={centerOnUserLocation}
            >
              <Ionicons name="locate" size={20} color={safeColors.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: safeColors.card }]}
            onPress={centerOnIncidents}
          >
            <Ionicons name="search" size={20} color={safeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Map Legend */}
        <View style={[styles.mapLegend, { backgroundColor: safeColors.card }]}>
          <Text style={[styles.legendTitle, { color: safeColors.text }]}>Incident Types</Text>
          <View style={styles.legendItems}>
            {['crime', 'fire', 'accident', 'flood', 'earthquake'].map((category) => (
              <View key={category} style={styles.legendItem}>
                <View style={[
                  styles.legendColor, 
                  { backgroundColor: getCategoryColor(category) }
                ]} />
                <Text style={[styles.legendText, { color: safeColors.text }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Incidents Summary */}
      <View style={[styles.summaryContainer, { backgroundColor: safeColors.card }]}>
        <Text style={[styles.summaryTitle, { color: safeColors.text }]}>
          {incidents.length} Incidents Reported
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  placeholderSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  mapControls: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
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
    borderTopColor: '#e5e7eb',
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

export default MobileMapReactNative;
