import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Dynamic import for Leaflet
let L: any;
let leafletAvailable = false;

try {
  if (typeof window !== 'undefined') {
    L = require('leaflet');
    leafletAvailable = true;
    console.log('✅ Leaflet loaded successfully');
  }
} catch (error: any) {
  console.warn('⚠️ Leaflet not available:', error.message);
  leafletAvailable = false;
}

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

interface WebMapEnhancedProps {
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

type MapProvider = 'openstreetmap' | 'google';

const WebMapEnhanced: React.FC<WebMapEnhancedProps> = ({
  incidents,
  onIncidentSelect,
  userLocation,
  initialRegion
}) => {
  const { colors } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapProvider, setMapProvider] = useState<MapProvider>('openstreetmap');
  const [showProviderSelector, setShowProviderSelector] = useState(false);

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
    if (!leafletAvailable) {
      setMapError('Leaflet maps not available');
      setLoading(false);
      return;
    }

    initializeMap();
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [mapProvider]);

  useEffect(() => {
    if (mapInstanceRef.current && incidents.length > 0) {
      updateMarkers();
    }
  }, [incidents]);

  const initializeMap = () => {
    if (!mapRef.current || !L) return;

    try {
      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [currentRegion.latitude, currentRegion.longitude],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      // Add tile layer based on provider
      let tileLayer;
      if (mapProvider === 'google') {
        // Google Maps tile layer (requires API key in production)
        tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          attribution: '© Google Maps',
          maxZoom: 20,
        });
      } else {
        // OpenStreetMap tile layer
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });
      }

      tileLayer.addTo(map);

      // Add scale control
      L.control.scale().addTo(map);

      mapInstanceRef.current = map;

      // Add markers after map is ready
      setTimeout(() => {
        updateMarkers();
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
      setLoading(false);
    }
  };

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

  const createCustomIcon = (category: string, isUrgent: boolean, isVerified: boolean) => {
    const color = getCategoryColor(category);
    const iconName = getCategoryIcon(category);
    
    // Use Unicode symbols for better compatibility
    const iconSymbols = {
      'shield': '🛡️',
      'flame': '🔥',
      'car': '🚗',
      'water': '💧',
      'earth': '🌍',
      'pulse': '💓',
      'ellipsis-horizontal': '⚫'
    };
    
    const iconSymbol = iconSymbols[iconName] || '⚫';
    
    const iconHtml = `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 3px solid ${isVerified ? '#22c55e' : '#fff'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <span style="font-size: 20px;">${iconSymbol}</span>
        ${isUrgent ? '<div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background-color: #ff4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">⚡</div>' : ''}
        ${isVerified ? '<div style="position: absolute; bottom: -4px; right: -4px; width: 18px; height: 18px; background-color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</div>' : ''}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add incident markers
    incidents.forEach((incident) => {
      console.log('🗺️ Processing incident for web map:', {
        id: incident.id,
        title: incident.title,
        category: incident.category,
        latitude: incident.latitude,
        longitude: incident.longitude
      });
      
      if (incident.latitude === 0 && incident.longitude === 0) {
        console.log('⚠️ Skipping incident with no coordinates:', incident.title);
        return;
      }

      const marker = L.marker([incident.latitude, incident.longitude], {
        icon: createCustomIcon(incident.category, incident.is_urgent, incident.is_verified)
      });

      const popupContent = `
        <div style="min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${incident.title}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">
            ${incident.description}
          </p>
          <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
            <span style="
              background-color: ${getCategoryColor(incident.category)};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            ">
              ${incident.category}
            </span>
            <span style="
              background-color: #f3f4f6;
              color: #374151;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            ">
              ${incident.severity}
            </span>
            ${incident.is_urgent ? '<span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">URGENT</span>' : ''}
            ${incident.is_verified ? '<span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">VERIFIED</span>' : ''}
          </div>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
            📍 ${incident.address}
          </p>
          <div style="display: flex; gap: 16px; font-size: 12px; color: #6b7280;">
            <span>👁️ ${incident.views}</span>
            <span>❤️ ${incident.likes}</span>
            <span>💬 ${incident.comments_count}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapInstanceRef.current);
      
      marker.on('click', () => {
        if (onIncidentSelect) {
          onIncidentSelect(incident);
        }
      });

      markersRef.current.push(marker);
    });

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: #22c55e;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              animation: pulse 2s infinite;
            ">
              <i class="ionicon ion-person" style="font-size: 12px;"></i>
            </div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            </style>
          `,
          className: 'user-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      });

      userMarker.bindPopup(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
            Your Location
          </h3>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            📍 ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}
          </p>
        </div>
      `);

      userMarker.addTo(mapInstanceRef.current);
      markersRef.current.push(userMarker);
    }

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
    }
  };

  const centerOnIncidents = () => {
    if (incidents.length > 0 && mapInstanceRef.current) {
      const latitudes = incidents.map(incident => incident.latitude).filter(lat => lat !== 0);
      const longitudes = incidents.map(incident => incident.longitude).filter(lng => lng !== 0);
      
      if (latitudes.length > 0 && longitudes.length > 0) {
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        const bounds = L.latLngBounds(
          [minLat, minLng],
          [maxLat, maxLng]
        );
        
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  };

  const switchMapProvider = (provider: MapProvider) => {
    setMapProvider(provider);
    setShowProviderSelector(false);
  };

  if (!leafletAvailable) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: safeColors.background }]}>
        <Ionicons name="alert-circle" size={48} color={safeColors.warning} />
        <Text style={[styles.errorTitle, { color: safeColors.text }]}>Maps Not Available</Text>
        <Text style={[styles.errorText, { color: safeColors.secondary }]}>
          Leaflet maps are not available on this platform
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: safeColors.background }]}>
        <Ionicons name="map" size={48} color={safeColors.primary} />
        <Text style={[styles.loadingText, { color: safeColors.text }]}>Loading map...</Text>
      </View>
    );
  }

  if (mapError) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: safeColors.background }]}>
        <Ionicons name="alert-circle" size={48} color={safeColors.warning} />
        <Text style={[styles.errorTitle, { color: safeColors.text }]}>Map Error</Text>
        <Text style={[styles.errorText, { color: safeColors.secondary }]}>{mapError}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: safeColors.background }]}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        />

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

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: safeColors.card }]}
            onPress={() => setShowProviderSelector(!showProviderSelector)}
          >
            <Ionicons name="layers" size={20} color={safeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Map Provider Selector */}
        {showProviderSelector && (
          <View style={[styles.providerSelector, { backgroundColor: safeColors.card }]}>
            <Text style={[styles.providerTitle, { color: safeColors.text }]}>Map Provider</Text>
            <TouchableOpacity
              style={[
                styles.providerOption,
                mapProvider === 'openstreetmap' && { backgroundColor: safeColors.primary }
              ]}
              onPress={() => switchMapProvider('openstreetmap')}
            >
              <Ionicons 
                name="map" 
                size={16} 
                color={mapProvider === 'openstreetmap' ? '#fff' : safeColors.text} 
              />
              <Text style={[
                styles.providerText,
                { color: mapProvider === 'openstreetmap' ? '#fff' : safeColors.text }
              ]}>
                OpenStreetMap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.providerOption,
                mapProvider === 'google' && { backgroundColor: safeColors.primary }
              ]}
              onPress={() => switchMapProvider('google')}
            >
              <Ionicons 
                name="logo-google" 
                size={16} 
                color={mapProvider === 'google' ? '#fff' : safeColors.text} 
              />
              <Text style={[
                styles.providerText,
                { color: mapProvider === 'google' ? '#fff' : safeColors.text }
              ]}>
                Google Maps
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
          Click markers for details • {mapProvider === 'openstreetmap' ? 'OpenStreetMap' : 'Google Maps'}
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
  mapContainer: {
    flex: 1,
    position: 'relative',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  providerSelector: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 180,
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

export default WebMapEnhanced;
