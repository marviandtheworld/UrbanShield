import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// This file should only be imported on mobile platforms
// It directly imports react-native-maps without any conditional logic

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

interface MobileMapNativeProps {
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

type MapProvider = 'default' | 'google';

const MobileMapNative: React.FC<MobileMapNativeProps> = ({
  incidents,
  onIncidentSelect,
  userLocation,
  initialRegion
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapProvider, setMapProvider] = useState<MapProvider>('default');
  const [showProviderSelector, setShowProviderSelector] = useState(false);
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

  const getSeverityColor = (severity: string) => {
    const severityColors: { [key: string]: string } = {
      'low': '#22c55e',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'critical': '#dc2626'
    };
    return severityColors[severity] || '#f59e0b';
  };

  const handleIncidentPress = (incident: Incident) => {
    if (onIncidentSelect) {
      onIncidentSelect(incident);
    }
  };

  const handleMapPress = () => {
    // Handle map press if needed
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

  const switchMapProvider = (provider: MapProvider) => {
    setMapProvider(provider);
    setShowProviderSelector(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: safeColors.background }]}>
        <Ionicons name="map" size={48} color={safeColors.primary} />
        <Text style={[styles.loadingText, { color: safeColors.text }]}>Loading map...</Text>
      </View>
    );
  }

  // This will be replaced with actual MapView when imported
  return (
    <View style={[styles.container, styles.errorContainer, { backgroundColor: safeColors.background }]}>
      <Ionicons name="alert-circle" size={48} color={safeColors.warning} />
      <Text style={[styles.errorTitle, { color: safeColors.text }]}>Mobile Map</Text>
      <Text style={[styles.errorText, { color: safeColors.secondary }]}>
        This component should be replaced with actual MapView implementation
      </Text>
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default MobileMapNative;
