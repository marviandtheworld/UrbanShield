import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface WebMapFallbackProps {
  incidents: any[];
  onIncidentSelect?: (incident: any) => void;
}

const WebMapFallback: React.FC<WebMapFallbackProps> = ({ 
  incidents, 
  onIncidentSelect 
}) => {
  const theme = useTheme();
  
  // Fallback colors in case theme is undefined
  const colors = theme?.colors || {
    background: '#ffffff',
    card: '#f8f9fa',
    text: '#000000',
    secondary: '#6c757d',
    primary: '#007bff',
    surface: '#ffffff'
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Ionicons name="map" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Safety Map
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          {incidents.length} incidents reported
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface }]}>
          <Ionicons name="map-outline" size={48} color={colors.secondary} />
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            Interactive Map
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.secondary }]}>
            Full map functionality available on mobile devices
          </Text>
        </View>

        <View style={styles.incidentsList}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Recent Incidents
          </Text>
          
          {incidents.slice(0, 5).map((incident) => (
            <TouchableOpacity
              key={incident.id}
              style={[styles.incidentItem, { backgroundColor: colors.card }]}
              onPress={() => onIncidentSelect?.(incident)}
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
                {incident.is_verified && (
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                )}
              </View>
              
              <Text style={[styles.incidentDescription, { color: colors.secondary }]}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  incidentsList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  incidentItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
});

export default WebMapFallback;
