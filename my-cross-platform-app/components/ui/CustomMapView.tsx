import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface MapViewProps {
  session: Session | null;
  onAuthRequired: () => void;  // <-- change boolean → void
}


const MapView: React.FC<MapViewProps> = ({ session, onAuthRequired }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Rescue');
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.text }]}>UrbanShield</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications" size={20} color={colors.icon} />
            <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
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
              activeCategory === cat 
                ? { backgroundColor: colors.primary } 
                : { backgroundColor: colors.surface }
            ]}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === cat 
                ? { color: colors.background } 
                : { color: colors.text }
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.mapArea}>
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="map-marker-radius" size={48} color={colors.primary} />
          <Text style={[styles.mapText, { color: colors.text }]}>Map View</Text>
          <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>Install react-native-maps</Text>
          <Text style={[styles.mapNote, { color: colors.textMuted }]}>Import MapView from 'react-native-maps'</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.locationButton, { backgroundColor: colors.background }]}>
        <Ionicons name="location" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.bottomPanel, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.bottomPanelHeader}>
          <Text style={[styles.bottomPanelTitle, { color: colors.text }]}>In this area</Text>
          <TouchableOpacity style={[styles.bellButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.bottomPanelSubtext, { color: colors.textSecondary }]}>3 alerts past 24hrs</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
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
  mapArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 24,
    marginTop: 12,
    fontWeight: 'bold',
  },
  mapSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  mapNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    width: 48,
    height: 48,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderTopWidth: 1,
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
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanelSubtext: {
    fontSize: 14,
  },
});

export default MapView;