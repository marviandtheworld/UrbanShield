import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';

interface MapViewProps {
  session: Session | null;
  onAuthRequired: () => void;  // <-- change boolean → void
}


const MapView: React.FC<MapViewProps> = ({ session, onAuthRequired }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Rescue');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>UrbanShield</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {['Event', 'General', 'Rescue'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryPill,
              activeCategory === cat ? styles.categoryPillActive : styles.categoryPillInactive
            ]}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === cat ? styles.categoryTextActive : styles.categoryTextInactive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker-radius" size={48} color="#ef4444" />
          <Text style={styles.mapText}>Map View</Text>
          <Text style={styles.mapSubtext}>Install react-native-maps</Text>
          <Text style={styles.mapNote}>Import MapView from 'react-native-maps'</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.locationButton}>
        <Ionicons name="location" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.bottomPanel}>
        <View style={styles.bottomPanelHeader}>
          <Text style={styles.bottomPanelTitle}>In this area</Text>
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomPanelSubtext}>3 alerts past 24hrs</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryPill: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#fff',
  },
  categoryPillInactive: {
    backgroundColor: '#1a1a1a',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#000',
  },
  categoryTextInactive: {
    color: '#fff',
  },
  mapArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 24,
    color: '#fff',
    marginTop: 12,
    fontWeight: 'bold',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#737373',
    marginTop: 4,
  },
  mapNote: {
    fontSize: 12,
    color: '#525252',
    fontStyle: 'italic',
    marginTop: 4,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPanel: {
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  bottomPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bellButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanelSubtext: {
    fontSize: 14,
    color: '#737373',
  },
});

export default MapView;