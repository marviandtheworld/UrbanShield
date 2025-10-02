import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_type: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

interface Incident {
  id: string;
  user: string;
  username: string;
  distance: string;
  date: string;
  timeAgo: string;
  title: string;
  description: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
}

interface NewsViewProps {
  session: Session | null;
  userProfile: UserProfile | null;
  onAuthRequired: () => boolean;
}

const NewsView: React.FC<NewsViewProps> = ({ session, userProfile, onAuthRequired }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Rescue');

  const handleLike = (incidentId: string) => {
    if (!onAuthRequired()) return;
    Alert.alert('Like', 'Like functionality will be implemented');
  };

  const handleComment = (incidentId: string) => {
    if (!onAuthRequired()) return;
    Alert.alert('Comment', 'Comment feature will be implemented');
  };

  const incidents: Incident[] = [
    { 
      id: '1', 
      user: 'John Doe',
      username: '@johndoe_142',
      distance: '2.3 km',
      date: '28 Sep 2025',
      timeAgo: '2 hours ago',
      title: 'Water leak in downtown area needs immediate attention',
      description: 'Major water main break flooding street...',
      image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800',
      views: 45,
      likes: 12,
      comments: 3,
      category: 'Rescue'
    },
    { 
      id: '2', 
      user: 'Sarah Smith',
      username: '@sarahsmith',
      distance: '5.1 km',
      date: '27 Sep 2025',
      timeAgo: '5 hours ago',
      title: 'Broken streetlight causing safety hazard at night',
      description: 'Dark intersection needs repair...',
      image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
      views: 89,
      likes: 23,
      comments: 7,
      category: 'General'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>Global</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="send" size={20} color="#fff" />
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

      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {incidents.map((incident) => (
          <View key={incident.id} style={styles.incidentCard}>
            <View style={styles.incidentImageContainer}>
              <Image 
                source={{ uri: incident.image }} 
                style={styles.incidentImage}
                resizeMode="cover"
              />
              <View style={styles.viewBadge}>
                <Ionicons name="eye" size={14} color="#fff" />
                <Text style={styles.viewBadgeText}> {incident.views}</Text>
              </View>
            </View>

            <View style={styles.incidentContent}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={16} color="#737373" />
                </View>
                <View>
                  <Text style={styles.userName}>{incident.user}</Text>
                  <Text style={styles.userHandle}>{incident.username}</Text>
                </View>
              </View>

              <View style={styles.incidentMeta}>
                <Text style={styles.metaText}>{incident.distance}</Text>
                <Text style={styles.metaText}> • </Text>
                <Text style={styles.metaText}>{incident.date}</Text>
                <Text style={styles.metaText}> • </Text>
                <Text style={styles.metaText}>{incident.timeAgo}</Text>
              </View>

              <Text style={styles.incidentTitle}>{incident.title}</Text>
              <Text style={styles.incidentDescription} numberOfLines={2}>
                {incident.description}
              </Text>

              <View style={styles.actionsBar}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleLike(incident.id)}
                >
                  <Ionicons name="heart-outline" size={20} color="#737373" />
                  <Text style={styles.actionText}>{incident.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleComment(incident.id)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#737373" />
                  <Text style={styles.actionText}>{incident.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={20} color="#737373" />
                  <Text style={styles.actionText}>{incident.views}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={20} color="#737373" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  incidentCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  incidentImageContainer: {
    height: 192,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  incidentImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
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
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userHandle: {
    fontSize: 12,
    color: '#737373',
  },
  incidentMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#737373',
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 16,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#737373',
    marginLeft: 4,
  },
});

export default NewsView;