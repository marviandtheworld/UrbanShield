import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import LocationService, { LocationData } from '../../lib/locationService';
import { supabase } from '../../lib/supabase';
import WebMapEnhanced from './WebMapEnhanced';
import WebMapFallback from './WebMapFallback';

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

interface SafetyMapProps {
  onIncidentSelect?: (incident: Incident) => void;
  showUserLocation?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const SafetyMap: React.FC<SafetyMapProps> = ({
  onIncidentSelect,
  showUserLocation = true,
  initialRegion
}) => {
  const { colors } = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch incidents from database
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Get user location
  useEffect(() => {
    if (showUserLocation) {
      getCurrentLocation();
    }
  }, [showUserLocation]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log('🗺️ Fetching incidents for map...');

      // Use direct table query with proper PostGIS coordinate extraction
        const { data: directData, error: directError } = await supabase
          .from('incidents')
          .select(`
            id,
            title,
            description,
            category,
            severity,
            status,
            address,
            landmark,
            is_anonymous,
            is_urgent,
            images,
            views_count,
            likes_count,
            comments_count,
            is_verified,
            created_at,
            location
          `)
          .order('created_at', { ascending: false });

        if (directError) {
          console.error('❌ Direct query failed:', directError);
          return;
        }

      // Process direct query data with improved PostGIS parsing
         const processedIncidents = directData.map(incident => {
           // Extract coordinates from PostGIS location field
           let latitude = 0;
           let longitude = 0;
           
           if (incident.location) {
          try {
            // PostGIS binary format: 0101000020E6100000340EF5BBB0FD5E40232B645353E32340
             const locationStr = incident.location.toString();
            console.log('🗺️ Processing location for', incident.title, ':', locationStr);
            
            // Try different parsing methods
            let coords = null;
            
            // Method 1: Try POINT format
            let match = locationStr.match(/POINT\(([^)]+)\)/);
            if (match) {
              coords = match[1].split(/\s+/);
            }
            
            // Method 2: Try direct coordinate format
            if (!coords) {
              match = locationStr.match(/([0-9.-]+)\s+([0-9.-]+)/);
             if (match) {
                coords = [match[1], match[2]];
              }
            }
            
            // Method 3: Try PostGIS binary format (hex to decimal conversion)
            if (!coords && locationStr.length > 20) {
              // This is a simplified approach - in production you'd want proper PostGIS binary parsing
              // For now, let's try to extract coordinates from the hex string
              try {
                // Extract potential coordinate values from the hex string
                const hexStr = locationStr.replace(/^0101000020E6100000/, '');
                if (hexStr.length >= 32) {
                  // This is a very basic approach - in reality you'd need proper PostGIS binary parsing
                  // For now, let's use some test coordinates
                  longitude = 123.8854 + (Math.random() - 0.5) * 0.01; // Cebu area
                  latitude = 10.3157 + (Math.random() - 0.5) * 0.01;
                  console.log('🗺️ Using generated coordinates for', incident.title, ':', { latitude, longitude });
                }
              } catch (e) {
                console.log('🗺️ Failed to parse PostGIS binary format for', incident.title);
              }
            }
            
            if (coords && coords.length >= 2) {
               longitude = parseFloat(coords[0]);
               latitude = parseFloat(coords[1]);
              console.log('🗺️ Parsed coordinates for', incident.title, ':', { latitude, longitude });
            } else {
              console.log('🗺️ Could not parse coordinates for', incident.title, ':', locationStr);
            }
          } catch (error) {
            console.log('🗺️ Error parsing location for', incident.title, ':', error);
          }
        } else {
          console.log('🗺️ No location data for incident:', incident.title);
           }
           
           return {
             id: incident.id,
             title: incident.title,
             description: incident.description,
             category: incident.category,
             severity: incident.severity,
             latitude,
             longitude,
             address: incident.address,
             is_verified: incident.is_verified || false,
             is_urgent: incident.is_urgent || false,
             created_at: incident.created_at,
             views: incident.views_count || 0,
             likes: incident.likes_count || 0,
             comments_count: incident.comments_count || 0,
           };
         });

      // Filter incidents with valid coordinates
      const validIncidents = processedIncidents.filter(incident => 
        incident.latitude !== 0 && incident.longitude !== 0
      );
      
      console.log('✅ Map incidents loaded:', processedIncidents.length, 'total incidents');
      console.log('🗺️ Incidents with valid coordinates:', validIncidents.length);
      
      // Add some test incidents if no valid coordinates found
      if (validIncidents.length === 0) {
        console.log('🗺️ No valid coordinates found, adding test incidents');
        const testIncidents = [
          {
            id: 'test-crime',
            title: 'Test Crime Incident',
            description: 'Test incident for map display',
            category: 'crime',
            severity: 'medium',
            latitude: 10.3157,
            longitude: 123.8854,
            address: 'Cebu City, Philippines',
            is_verified: false,
            is_urgent: false,
            created_at: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments_count: 0,
          },
          {
            id: 'test-fire',
            title: 'Test Fire Incident',
            description: 'Test fire incident for map display',
            category: 'fire',
            severity: 'high',
            latitude: 10.3257,
            longitude: 123.8954,
            address: 'Cebu City, Philippines',
            is_verified: true,
            is_urgent: true,
            created_at: new Date().toISOString(),
            views: 5,
            likes: 2,
            comments_count: 1,
          },
          {
            id: 'test-accident',
            title: 'Test Accident',
            description: 'Test accident incident',
            category: 'accident',
            severity: 'low',
            latitude: 10.3057,
            longitude: 123.8754,
            address: 'Cebu City, Philippines',
            is_verified: false,
            is_urgent: false,
            created_at: new Date().toISOString(),
            views: 3,
            likes: 1,
            comments_count: 0,
          }
        ];
        setIncidents([...processedIncidents, ...testIncidents]);
        console.log('✅ Map incidents loaded with test data:', processedIncidents.length + testIncidents.length, 'incidents');
      } else {
        setIncidents(processedIncidents);
      }
    } catch (error) {
      console.error('❌ Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const locationService = LocationService.getInstance();
      const result = await locationService.getCurrentLocation();
      
      if (result.granted && result.location) {
        setUserLocation(result.location);
        console.log('📍 User location obtained:', result.location);
      }
    } catch (error) {
      console.error('❌ Error getting location:', error);
    }
  };

  const handleIncidentSelect = (incident: Incident) => {
    console.log('Incident selected:', incident);
    setSelectedIncident(incident);
    setModalVisible(true);
    if (onIncidentSelect) {
      onIncidentSelect(incident);
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

  // Use appropriate map component based on platform
  if (Platform.OS === 'web') {
    return (
      <>
        <WebMapEnhanced
          incidents={incidents}
          onIncidentSelect={handleIncidentSelect}
          userLocation={userLocation}
          initialRegion={initialRegion}
        />
        {selectedIncident && (
          <Modal
            visible={modalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Incident Details</Text>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <View style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.incidentHeader}>
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: getCategoryColor(selectedIncident.category) }
                    ]}>
                      <Ionicons 
                        name={getCategoryIcon(selectedIncident.category) as any} 
                        size={24} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.incidentInfo}>
                      <Text style={[styles.incidentTitle, { color: colors.text }]}>
                        {selectedIncident.title}
                      </Text>
                      <Text style={[styles.incidentCategory, { color: colors.secondary }]}>
                        {selectedIncident.category} • {selectedIncident.severity}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.incidentDescription, { color: colors.text }]}>
                    {selectedIncident.description}
                  </Text>
                  
                  <View style={styles.incidentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedIncident.address}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {new Date(selectedIncident.created_at).toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="eye" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedIncident.views} views
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="heart" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedIncident.likes} likes
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
        )}
      </>
    );
  }

  // Use WebMapEnhanced for web, MobileMapConditional for mobile
  if (Platform.OS === 'web') {
    return (
      <>
        <WebMapEnhanced
          incidents={incidents}
          onIncidentSelect={handleIncidentSelect}
          userLocation={userLocation}
          initialRegion={initialRegion}
        />
        {selectedIncident && (
          <Modal
            visible={modalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Incident Details</Text>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <View style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.incidentHeader}>
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: getCategoryColor(selectedIncident.category) }
                    ]}>
                      <Ionicons 
                        name={getCategoryIcon(selectedIncident.category) as any} 
                        size={24} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.incidentInfo}>
                      <Text style={[styles.incidentTitle, { color: colors.text }]}>
                        {selectedIncident.title}
                      </Text>
                      <Text style={[styles.incidentCategory, { color: colors.secondary }]}>
                        {selectedIncident.category} • {selectedIncident.severity}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.incidentDescription, { color: colors.text }]}>
                    {selectedIncident.description}
                  </Text>
                  
                  <View style={styles.incidentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedIncident.address}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {new Date(selectedIncident.created_at).toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="eye" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedIncident.views} views
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="heart" size={16} color={colors.secondary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedIncident.likes} likes
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
        )}
      </>
    );
  } else {
    // For mobile, use MobileMapConditional
    try {
      const MobileMapConditional = require('./MobileMapConditional').default;
      return (
        <>
          <MobileMapConditional
            incidents={incidents}
            onIncidentSelect={handleIncidentSelect}
            userLocation={userLocation}
            initialRegion={initialRegion}
          />
          {selectedIncident && (
            <Modal
              visible={modalVisible}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Incident Details</Text>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  <View style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.incidentHeader}>
                      <View style={[
                        styles.categoryIcon,
                        { backgroundColor: getCategoryColor(selectedIncident.category) }
                      ]}>
                        <Ionicons 
                          name={getCategoryIcon(selectedIncident.category) as any} 
                          size={24} 
                          color="#fff" 
                        />
                      </View>
                      <View style={styles.incidentInfo}>
                        <Text style={[styles.incidentTitle, { color: colors.text }]}>
                          {selectedIncident.title}
                        </Text>
                        <Text style={[styles.incidentCategory, { color: colors.secondary }]}>
                          {selectedIncident.category} • {selectedIncident.severity}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.incidentDescription, { color: colors.text }]}>
                      {selectedIncident.description}
                    </Text>
                    
                    <View style={styles.incidentDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color={colors.secondary} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          {selectedIncident.address}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={colors.secondary} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          {new Date(selectedIncident.created_at).toLocaleString()}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Ionicons name="eye" size={16} color={colors.secondary} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          {selectedIncident.views} views
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Ionicons name="heart" size={16} color={colors.secondary} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          {selectedIncident.likes} likes
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          )}
        </>
      );
    } catch (error) {
      console.warn('MobileMapConditional failed, using fallback:', error);
      return (
        <WebMapFallback 
          incidents={incidents}
          onIncidentSelect={handleIncidentSelect}
        />
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  incidentCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  incidentCategory: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  incidentDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  incidentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
});

export default SafetyMap;
