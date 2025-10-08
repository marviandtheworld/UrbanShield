import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import LocationService, { LocationData } from '../../lib/locationService';
import { supabase } from '../../lib/supabase';
import MobileMap from './MobileMap';
import WebMapFallback from './WebMapFallback';
import WebMapLeaflet from './WebMapLeaflet';

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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_incidents_with_user_info');

      if (rpcError) {
        console.warn('⚠️ RPC failed, trying direct query:', rpcError);
        
        // Fallback to direct table query - show ALL incidents including unverified
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

         // Process direct query data
         const processedIncidents = directData.map(incident => {
           // Extract coordinates from PostGIS location field
           let latitude = 0;
           let longitude = 0;
           
           if (incident.location) {
             // Parse PostGIS POINT format: "POINT(lng lat)"
             const locationStr = incident.location.toString();
             const match = locationStr.match(/POINT\(([^)]+)\)/);
             if (match) {
               const coords = match[1].split(' ');
               longitude = parseFloat(coords[0]);
               latitude = parseFloat(coords[1]);
             }
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

        setIncidents(processedIncidents);
        console.log('✅ Direct query successful:', processedIncidents.length, 'incidents');
        return;
      }

       // Process RPC data
       const processedIncidents = rpcData.map(incident => {
         // Extract coordinates from PostGIS location field
         let latitude = 0;
         let longitude = 0;
         
         if (incident.location) {
           // Parse PostGIS POINT format: "POINT(lng lat)"
           const locationStr = incident.location.toString();
           const match = locationStr.match(/POINT\(([^)]+)\)/);
           if (match) {
             const coords = match[1].split(' ');
             longitude = parseFloat(coords[0]);
             latitude = parseFloat(coords[1]);
           }
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
           views: incident.views || 0,
           likes: incident.likes || 0,
           comments_count: incident.comments_count || 0,
         };
       });

      setIncidents(processedIncidents);
      console.log('✅ RPC successful:', processedIncidents.length, 'incidents');
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

  // Use appropriate map component based on platform
  if (Platform.OS === 'web') {
    return (
      <WebMapLeaflet
        incidents={incidents}
        onIncidentSelect={onIncidentSelect}
        userLocation={userLocation}
        initialRegion={initialRegion}
      />
    );
  }

  // For mobile platforms, try MobileMap first, fallback to WebMapFallback
  try {
    return (
      <MobileMap
        incidents={incidents}
        onIncidentSelect={onIncidentSelect}
        userLocation={userLocation}
        initialRegion={initialRegion}
      />
    );
  } catch (error) {
    console.warn('MobileMap failed, using fallback:', error);
    return (
      <WebMapFallback
        incidents={incidents}
        onIncidentSelect={onIncidentSelect}
      />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafetyMap;
