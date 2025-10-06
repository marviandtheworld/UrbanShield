import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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

interface WebMapProps {
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

const WebMap: React.FC<WebMapProps> = ({
  incidents,
  onIncidentSelect,
  userLocation,
  initialRegion
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Load map immediately
    setLoading(false);
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

  const handleRetry = () => {
    setMapError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading map...</Text>
      </View>
    );
  }

  if (mapError) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={colors.warning} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Map Error</Text>
        <Text style={[styles.errorText, { color: colors.secondary }]}>{mapError}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color={colors.primary} />
          <Text style={[styles.mapTitle, { color: colors.text }]}>Safety Map</Text>
          <Text style={[styles.mapSubtitle, { color: colors.secondary }]}>
            {incidents.length} incidents reported
          </Text>
          
          {/* Incident Pins on Map */}
          {incidents.map((incident, index) => (
            <View
              key={incident.id}
              style={[
                styles.incidentPin,
                {
                  backgroundColor: getCategoryColor(incident.category),
                  left: 50 + (index * 30) % 200, // Spread pins across map
                  top: 100 + (index * 20) % 150,
                }
              ]}
            >
              <Ionicons 
                name={getCategoryIcon(incident.category) as any} 
                size={16} 
                color="#fff" 
              />
              {incident.is_urgent && (
                <View style={styles.urgentIndicator}>
                  <Ionicons name="flash" size={8} color="#fff" />
                </View>
              )}
            </View>
          ))}
          
          {/* User Location Indicator */}
          {userLocation && (
            <View style={[styles.userLocationIndicator, { backgroundColor: '#22c55e' }]}>
              <Ionicons name="person" size={16} color="#fff" />
              <Text style={styles.userLocationText}>Your Location</Text>
            </View>
          )}
          
          {/* Map Legend */}
          <View style={[styles.mapLegend, { backgroundColor: colors.card }]}>
            <Text style={[styles.legendTitle, { color: colors.text }]}>Incident Types</Text>
            <View style={styles.legendItems}>
              {['crime', 'fire', 'accident', 'flood', 'earthquake'].map((category) => (
                <View key={category} style={styles.legendItem}>
                  <View style={[
                    styles.legendColor, 
                    { backgroundColor: getCategoryColor(category) }
                  ]} />
                  <Text style={[styles.legendText, { color: colors.text }]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Incidents List */}
      <View style={styles.incidentsContainer}>
        <Text style={[styles.incidentsTitle, { color: colors.text }]}>
          Recent Incidents ({incidents.length})
        </Text>
        
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No incidents reported</Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
              Your area is safe! Check back later for updates.
            </Text>
          </View>
        ) : (
          <View style={styles.incidentsList}>
            {incidents.slice(0, 5).map((incident) => (
              <TouchableOpacity
                key={incident.id}
                style={[styles.incidentItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleIncidentPress(incident)}
              >
                <View style={styles.incidentHeader}>
                  <View style={[
                    styles.categoryIndicator,
                    { backgroundColor: getCategoryColor(incident.category) }
                  ]}>
                    <Ionicons 
                      name={getCategoryIcon(incident.category) as any} 
                      size={16} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.incidentInfo}>
                    <Text style={[styles.incidentTitle, { color: colors.text }]}>
                      {incident.title}
                    </Text>
                    <Text style={[styles.incidentCategory, { color: colors.secondary }]}>
                      {incident.category} • {incident.severity}
                    </Text>
                  </View>
                  <View style={styles.incidentBadges}>
                    {incident.is_verified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#fff" />
                      </View>
                    )}
                    {incident.is_urgent && (
                      <View style={[styles.urgentBadge, { backgroundColor: colors.warning }]}>
                        <Ionicons name="flash" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                </View>
                
                <Text style={[styles.incidentDescription, { color: colors.secondary }]} numberOfLines={2}>
                  {incident.description}
                </Text>
                
                <Text style={[styles.incidentAddress, { color: colors.secondary }]}>
                  📍 {incident.address}
                </Text>
                
                <View style={styles.incidentStats}>
                  <View style={styles.stat}>
                    <Ionicons name="eye" size={14} color={colors.secondary} />
                    <Text style={[styles.statText, { color: colors.secondary }]}>
                      {incident.views}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart" size={14} color={colors.secondary} />
                    <Text style={[styles.statText, { color: colors.secondary }]}>
                      {incident.likes}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="chatbubble" size={14} color={colors.secondary} />
                    <Text style={[styles.statText, { color: colors.secondary }]}>
                      {incident.comments_count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Incident Types</Text>
        <View style={styles.legendItems}>
          {['crime', 'fire', 'accident', 'flood', 'earthquake'].map((category) => (
            <View key={category} style={styles.legendItem}>
              <View style={[
                styles.legendColor, 
                { backgroundColor: getCategoryColor(category) }
              ]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
          ))}
        </View>
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
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  mapSubtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  userLocationIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  userLocationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  incidentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  incidentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  incidentsList: {
    flex: 1,
  },
  incidentItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  incidentCategory: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  incidentBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incidentDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  incidentAddress: {
    fontSize: 12,
    marginBottom: 8,
  },
  incidentStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  legend: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // New styles for map pins and legend
  incidentPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  urgentIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default WebMap;