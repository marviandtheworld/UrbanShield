import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';

interface LiveViewProps {
  session: Session | null;
  onAuthRequired: () => boolean;
}

const LiveView: React.FC<LiveViewProps> = ({ session, onAuthRequired }) => {
  const handleStartLive = (category: string) => {
    if (!onAuthRequired()) return;
    Alert.alert('Start Live', `Starting ${category} live stream...`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView contentContainerStyle={styles.liveContainer}>
        <View style={styles.liveHeader}>
          <Text style={styles.liveTitle}>Choose Live Category</Text>
          <Text style={styles.liveSubtitle}>Select the type of live stream you want to start</Text>
        </View>

        <View style={styles.liveCategories}>
          <TouchableOpacity 
            style={styles.liveCategoryCard}
            onPress={() => handleStartLive('Events')}
          >
            <Ionicons name="alert-circle" size={32} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.liveCategoryTitle}>Events</Text>
            <Text style={styles.liveCategoryDescription}>
              Live record incidents that take place around you in real-time.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.liveCategoryCard}
            onPress={() => handleStartLive('Rescue')}
          >
            <Ionicons name="notifications" size={32} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.liveCategoryTitle}>Rescue</Text>
            <Text style={styles.liveCategoryDescription}>
              Alert citizens in your surroundings for lost person, animal, object.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.liveCategoryCard}
            onPress={() => handleStartLive('General')}
          >
            <Ionicons name="location" size={32} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.liveCategoryTitle}>General</Text>
            <Text style={styles.liveCategoryDescription}>
              Notify people around you about your requirements. (Services, Object Requirements, Marketing)
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.startLiveButton}
          onPress={() => handleStartLive('General')}
        >
          <Text style={styles.startLiveText}>Start Live</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  liveContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  liveHeader: {
    marginBottom: 48,
  },
  liveTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  liveSubtitle: {
    fontSize: 16,
    color: '#737373',
  },
  liveCategories: {
    marginBottom: 32,
  },
  liveCategoryCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#262626',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  liveCategoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  liveCategoryDescription: {
    fontSize: 14,
    color: '#737373',
    lineHeight: 20,
  },
  startLiveButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  startLiveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default LiveView;