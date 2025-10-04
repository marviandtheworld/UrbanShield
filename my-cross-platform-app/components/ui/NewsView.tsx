import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  user_type: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  address: string;
  landmark?: string;
  is_anonymous: boolean;
  is_urgent: boolean;
  is_rescue: boolean;
  images?: string[];
  views: number;
  likes: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  username: string;
  user_type: string;
}

interface NewsViewProps {
  session: Session | null;
  userProfile: UserProfile | null;
  onAuthRequired: () => boolean;
  refreshTrigger?: number;
}

const NewsView: React.FC<NewsViewProps> = ({ session, userProfile, onAuthRequired, refreshTrigger }) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = Colors[isDark ? 'dark' : 'light'];

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_incidents_with_user_info');

      if (error) {
        console.error('Error fetching incidents:', error);
        Alert.alert('Error', 'Failed to load incidents');
        return;
      }

      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      Alert.alert('Error', 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      fetchIncidents();
    }
  }, [refreshTrigger]);

  const handleLike = async (incidentId: string) => {
    if (!onAuthRequired()) return;
    
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ likes: incidents.find(i => i.id === incidentId)?.likes + 1 })
        .eq('id', incidentId);

      if (error) throw error;

      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, likes: incident.likes + 1 }
            : incident
        )
      );
    } catch (error) {
      console.error('Error liking incident:', error);
      Alert.alert('Error', 'Failed to like incident');
    }
  };

  const handleComment = (incidentId: string) => {
    if (!onAuthRequired()) return;
    Alert.alert('Comment', 'Comment feature will be implemented');
  };

  const handleView = async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ views: incidents.find(i => i.id === incidentId)?.views + 1 })
        .eq('id', incidentId);

      if (error) throw error;

      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, views: incident.views + 1 }
            : incident
        )
      );
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'crime': 'Crime-Krimen',
      'fire': 'Fire-Sunog',
      'accident': 'Accident',
      'flood': 'Flood-Baha',
      'landslide': 'Landslide',
      'earthquake': 'Earthquake-Linog',
      'other': 'Others'
    };
    return categoryMap[category] || category;
  };

  const getSeverityColor = (severity: string) => {
    const severityColors: { [key: string]: string } = {
      'low': colors.success,
      'medium': colors.warning,
      'high': colors.error,
      'critical': '#dc2626'
    };
    return severityColors[severity] || colors.secondary;
  };

  const filteredIncidents = activeCategory === 'all' 
    ? incidents 
    : incidents.filter(incident => incident.category === activeCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.text }]}>Global</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
            <Ionicons name="filter" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
            <Ionicons name="send" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {['all', 'crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryPill,
              { backgroundColor: activeCategory === cat ? colors.primary : colors.card },
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: activeCategory === cat ? '#fff' : colors.text }
            ]}>
              {cat === 'all' ? 'All' : getCategoryDisplayName(cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.feed} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading incidents...</Text>
          </View>
        ) : filteredIncidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No incidents found</Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {activeCategory === 'all' 
                ? 'Be the first to report an incident!' 
                : `No ${getCategoryDisplayName(activeCategory)} incidents found`
              }
            </Text>
          </View>
        ) : (
          filteredIncidents.map((incident) => (
            <View key={incident.id} style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.incidentImageContainer, { backgroundColor: colors.surface }]}>
                {incident.images && incident.images.length > 0 ? (
                  <Image 
                    source={{ uri: incident.images[0] }} 
                    style={styles.incidentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="camera" size={32} color={colors.secondary} />
                  </View>
                )}
                <View style={styles.viewBadge}>
                  <Ionicons name="eye" size={14} color="#fff" />
                  <Text style={styles.viewBadgeText}> {incident.views}</Text>
                </View>
                {incident.is_urgent && (
                  <View style={[styles.urgentBadge, { backgroundColor: colors.error }]}>
                    <Text style={styles.urgentText}>URGENT</Text>
                  </View>
                )}
                {incident.is_rescue && (
                  <View style={[styles.rescueBadge, { backgroundColor: colors.warning }]}>
                    <Text style={styles.rescueText}>RESCUE</Text>
                  </View>
                )}
              </View>

              <View style={styles.incidentContent}>
                <View style={styles.userInfo}>
                  <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="person" size={16} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={[styles.userName, { color: colors.text }]}>{incident.user_name}</Text>
                    <Text style={[styles.userHandle, { color: colors.secondary }]}>{incident.username}</Text>
                  </View>
                </View>

                <View style={styles.incidentMeta}>
                  <Text style={[styles.metaText, { color: colors.secondary }]}>{incident.address}</Text>
                  <Text style={[styles.metaText, { color: colors.secondary }]}> • </Text>
                  <Text style={[styles.metaText, { color: colors.secondary }]}>{formatTimeAgo(incident.created_at)}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                    <Text style={styles.severityText}>{incident.severity.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={[styles.incidentTitle, { color: colors.text }]}>{incident.title}</Text>
                <Text style={[styles.incidentDescription, { color: colors.secondary }]} numberOfLines={2}>
                  {incident.description}
                </Text>

                <View style={[styles.actionsBar, { borderTopColor: colors.border }]}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(incident.id)}
                  >
                    <Ionicons name="heart-outline" size={20} color={colors.secondary} />
                    <Text style={[styles.actionText, { color: colors.secondary }]}>{incident.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleComment(incident.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={colors.secondary} />
                    <Text style={[styles.actionText, { color: colors.secondary }]}>{incident.comments_count}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleView(incident.id)}
                  >
                    <Ionicons name="eye-outline" size={20} color={colors.secondary} />
                    <Text style={[styles.actionText, { color: colors.secondary }]}>{incident.views}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={20} color={colors.secondary} />
                    <Text style={[styles.actionText, { color: colors.secondary }]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  incidentCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  incidentImageContainer: {
    height: 192,
    position: 'relative',
  },
  incidentImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rescueBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rescueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  incidentContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 12,
  },
  incidentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default NewsView;