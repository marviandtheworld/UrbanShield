import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
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

interface Comment {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user_name: string;
  username: string;
  user_type: string;
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
  is_rescue?: boolean;  // Local data only - not stored in database
  images?: string[];
  views: number;
  likes: number;
  comments_count: number;
  shares_count?: number;  // Make optional in case column doesn't exist
  is_verified?: boolean;  // Make optional in case column doesn't exist
  created_at: string;
  updated_at: string;
  user_name: string;
  username: string;
  user_type: string;
  comments?: Comment[];  // Add comments array
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
  const [rescueIncidents, setRescueIncidents] = useState<Set<string>>(new Set()); // Local rescue state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [likedIncidents, setLikedIncidents] = useState<Set<string>>(new Set()); // Track liked incidents

  const colors = Colors[isDark ? 'dark' : 'light'];

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log('🔍 NewsView: Fetching incidents...');
      
      const { data, error } = await supabase
        .rpc('get_incidents_with_user_info');

      console.log('🔍 NewsView: Fetch result:', { data: data?.length, error });

      if (error) {
        console.error('❌ NewsView: Error fetching incidents:', error);
        Alert.alert('Error', `Failed to load incidents: ${error.message}`);
        return;
      }

      console.log('✅ NewsView: Incidents fetched successfully:', data?.length || 0, 'incidents');
      
      if (data && data.length > 0) {
        setIncidents(data);
      } else {
        console.log('⚠️ NewsView: No incidents from function, trying direct table query...');
        // Fallback: try direct table query
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
            shares_count,
            is_verified,
            created_at,
            updated_at,
            profiles!reporter_id (
              full_name,
              username,
              user_type
            )
          `)
          .order('created_at', { ascending: false });

        if (directError) {
          console.error('❌ NewsView: Direct query also failed:', directError);
        } else {
          console.log('✅ NewsView: Direct query successful:', directData?.length || 0, 'incidents');
          const formattedIncidents = directData?.map(incident => ({
            ...incident,
            views: incident.views_count || 0,  // Map views_count to views
            likes: incident.likes_count || 0,  // Map likes_count to likes
            is_rescue: false,  // Default since not in schema
            is_approved: true,  // Default since not in schema
            user_name: incident.profiles?.full_name || 'Unknown User',
            username: incident.profiles?.username || '@unknown',
            user_type: incident.profiles?.user_type || 'guest',
          })) || [];
          setIncidents(formattedIncidents);
        }
      }
    } catch (error) {
      console.error('❌ NewsView: Exception fetching incidents:', error);
      Alert.alert('Error', `Failed to load incidents: ${error}`);
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
    if (!session) {
      Alert.alert(
        'Sign In Required', 
        'Please sign in to like incidents',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => onAuthRequired() }
        ]
      );
      return;
    }
    
    try {
      const currentIncident = incidents.find(i => i.id === incidentId);
      if (!currentIncident) return;

      const isCurrentlyLiked = likedIncidents.has(incidentId);
      const newLikesCount = isCurrentlyLiked 
        ? Math.max((currentIncident.likes || 0) - 1, 0)  // Unlike: decrease by 1, minimum 0
        : (currentIncident.likes || 0) + 1;  // Like: increase by 1
      
      const { error } = await supabase
        .from('incidents')
        .update({ likes_count: newLikesCount })
        .eq('id', incidentId);

      if (error) throw error;

      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, likes: newLikesCount }
            : incident
        )
      );

      // Update liked incidents set
      setLikedIncidents(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(incidentId);
        } else {
          newSet.add(incidentId);
        }
        return newSet;
      });
      
      console.log('✅ Like/Unlike successful for incident:', incidentId, 'New count:', newLikesCount, 'Liked:', !isCurrentlyLiked);
    } catch (error) {
      console.error('Error liking incident:', error);
      Alert.alert('Error', 'Failed to like incident');
    }
  };

  const handleComment = (incidentId: string) => {
    if (!session) {
      Alert.alert(
        'Sign In Required', 
        'Please sign in to comment on incidents',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => onAuthRequired() }
        ]
      );
      return;
    }
    
    setSelectedIncidentId(incidentId);
    setCommentText('');
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async (incidentId: string, commentText: string) => {
    try {
      if (!session?.user?.id) {
        Alert.alert('Error', 'You must be logged in to comment');
        return;
      }

      // Insert comment into database
      const { data, error } = await supabase
        .from('comments')
        .insert({
          incident_id: incidentId,
          user_id: session.user.id,
          content: commentText,
          is_anonymous: false // For now, always show user info
        })
        .select();

      if (error) throw error;

      console.log('✅ Comment added for incident:', incidentId, 'Comment ID:', data?.[0]?.id);
      
      // Refresh comments for this incident
      await fetchComments(incidentId);
      
      Alert.alert('Success', 'Comment added successfully!');
      
      // Close modal and reset state
      setShowCommentModal(false);
      setCommentText('');
      setSelectedIncidentId(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleCommentModalSubmit = () => {
    if (!selectedIncidentId || !commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }
    
    handleCommentSubmit(selectedIncidentId, commentText.trim());
  };

  const fetchComments = async (incidentId: string) => {
    try {
      setLoadingComments(prev => new Set(prev).add(incidentId));
      
      console.log('🔍 Fetching comments for incident:', incidentId);
      
      // Try RPC function first
      const { data, error } = await supabase
        .rpc('get_comments_with_user_info', { incident_uuid: incidentId });

      if (error) {
        console.warn('❌ RPC function failed, trying direct query:', error);
        
        // Fallback: direct table query
        const { data: directData, error: directError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            is_anonymous,
            created_at,
            profiles!user_id (
              full_name,
              username,
              user_type
            )
          `)
          .eq('incident_id', incidentId)
          .order('created_at', { ascending: true });

        if (directError) {
          console.error('❌ Direct query also failed:', directError);
          return;
        }

        console.log('✅ Direct query successful:', directData?.length || 0, 'comments');
        
        // Format the data to match the expected structure
        const formattedComments = directData?.map(comment => ({
          id: comment.id,
          content: comment.content,
          is_anonymous: comment.is_anonymous,
          created_at: comment.created_at,
          user_name: comment.is_anonymous ? 'Anonymous User' : (comment.profiles?.full_name || 'Unknown User'),
          username: comment.is_anonymous ? '@anonymous' : (comment.profiles?.username || '@unknown'),
          user_type: comment.profiles?.user_type || 'community_member',
        })) || [];

        // Update the incident with comments
        setIncidents(prev => 
          prev.map(incident => 
            incident.id === incidentId 
              ? { ...incident, comments: formattedComments }
              : incident
          )
        );
      } else {
        console.log('✅ RPC function successful:', data?.length || 0, 'comments');
        
        // Update the incident with comments
        setIncidents(prev => 
          prev.map(incident => 
            incident.id === incidentId 
              ? { ...incident, comments: data || [] }
              : incident
          )
        );
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(incidentId);
        return newSet;
      });
    }
  };

  const toggleComments = (incidentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(incidentId)) {
        newSet.delete(incidentId);
      } else {
        newSet.add(incidentId);
        // Fetch comments if not already loaded
        const incident = incidents.find(i => i.id === incidentId);
        if (incident && !incident.comments) {
          fetchComments(incidentId);
        }
      }
      return newSet;
    });
  };


  const handleRescue = (incidentId: string) => {
    if (!session) {
      Alert.alert(
        'Sign In Required', 
        'Please sign in to mark incidents for rescue',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => onAuthRequired() }
        ]
      );
      return;
    }
    
    setRescueIncidents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(incidentId)) {
        newSet.delete(incidentId);
        Alert.alert('Rescue Removed', 'This incident is no longer marked as rescue');
      } else {
        newSet.add(incidentId);
        Alert.alert('Rescue Marked', 'This incident has been marked as rescue');
      }
      return newSet;
    });
  };

  const handleView = async (incidentId: string) => {
    try {
      const currentIncident = incidents.find(i => i.id === incidentId);
      if (!currentIncident) return;

      const newViewsCount = (currentIncident.views || 0) + 1;
      
      const { error } = await supabase
        .from('incidents')
        .update({ views_count: newViewsCount })
        .eq('id', incidentId);

      if (error) throw error;

      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, views: newViewsCount }
            : incident
        )
      );
      
      console.log('✅ View count updated for incident:', incidentId, 'New count:', newViewsCount);
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

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'crime': '#ef4444',
      'fire': '#ff6b35',
      'accident': '#f59e0b',
      'flood': '#3b82f6',
      'landslide': '#8b5cf6',
      'earthquake': '#dc2626',
      'other': '#737373'
    };
    return categoryColors[category] || colors.secondary;
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
    : incidents.filter(incident => {
        const matches = incident.category === activeCategory;
        console.log('🔍 Category filter:', {
          incidentCategory: incident.category,
          activeCategory,
          matches,
          incidentTitle: incident.title
        });
        return matches;
      });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.text }]}>UrbanShield</Text>
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
                {rescueIncidents.has(incident.id) && (
                  <View style={[styles.rescueBadge, { backgroundColor: colors.warning }]}>
                    <Text style={styles.rescueText}>RESCUE</Text>
                  </View>
                )}
                {incident.is_verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: '#22c55e' }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#fff" />
                    <Text style={styles.verifiedText}>VERIFIED</Text>
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
                </View>

                <View style={styles.incidentTypeRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(incident.category) }]}>
                    <Text style={styles.categoryText}>{getCategoryDisplayName(incident.category)}</Text>
                  </View>
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
                    <Ionicons 
                      name={likedIncidents.has(incident.id) ? "heart" : "heart-outline"} 
                      size={20} 
                      color={likedIncidents.has(incident.id) ? "#ef4444" : colors.secondary} 
                    />
                    <Text style={[
                      styles.actionText, 
                      { color: likedIncidents.has(incident.id) ? "#ef4444" : colors.secondary }
                    ]}>
                      {incident.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => toggleComments(incident.id)}
                  >
                    <Ionicons 
                      name={expandedComments.has(incident.id) ? "chatbubble" : "chatbubble-outline"} 
                      size={20} 
                      color={expandedComments.has(incident.id) ? colors.primary : colors.secondary} 
                    />
                    <Text style={[
                      styles.actionText, 
                      { color: expandedComments.has(incident.id) ? colors.primary : colors.secondary }
                    ]}>
                      {incident.comments_count}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleView(incident.id)}
                  >
                    <Ionicons name="eye-outline" size={20} color={colors.secondary} />
                    <Text style={[styles.actionText, { color: colors.secondary }]}>{incident.views}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleRescue(incident.id)}
                  >
                    <Ionicons 
                      name={rescueIncidents.has(incident.id) ? "heart" : "heart-outline"} 
                      size={20} 
                      color={rescueIncidents.has(incident.id) ? "#f59e0b" : colors.secondary} 
                    />
                    <Text style={[
                      styles.actionText, 
                      { color: rescueIncidents.has(incident.id) ? "#f59e0b" : colors.secondary }
                    ]}>
                      {rescueIncidents.has(incident.id) ? "Rescue" : "Rescue"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={20} color={colors.secondary} />
                    <Text style={[styles.actionText, { color: colors.secondary }]}>{incident.shares_count || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Comments Section */}
              {expandedComments.has(incident.id) && (
                <View style={[styles.commentsSection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                  <View style={styles.commentsHeader}>
                    <Text style={[styles.commentsTitle, { color: colors.text }]}>
                      Comments ({incident.comments_count})
                    </Text>
                    <TouchableOpacity 
                      style={[styles.addCommentButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleComment(incident.id)}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text style={styles.addCommentText}>Add Comment</Text>
                    </TouchableOpacity>
                  </View>

                  {loadingComments.has(incident.id) ? (
                    <View style={styles.commentsLoading}>
                      <Text style={[styles.commentsLoadingText, { color: colors.secondary }]}>
                        Loading comments...
                      </Text>
                    </View>
                  ) : incident.comments && incident.comments.length > 0 ? (
                    <View style={styles.commentsList}>
                      {incident.comments.map((comment) => (
                        <View key={comment.id} style={[styles.commentItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View style={styles.commentHeader}>
                            <View style={styles.commentUser}>
                              <View style={[styles.commentAvatar, { backgroundColor: colors.surface }]}>
                                <Ionicons name="person" size={12} color={colors.secondary} />
                              </View>
                              <View>
                                <Text style={[styles.commentUserName, { color: colors.text }]}>
                                  {comment.user_name}
                                </Text>
                                <Text style={[styles.commentUserHandle, { color: colors.secondary }]}>
                                  {comment.username}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.commentTime, { color: colors.secondary }]}>
                              {formatTimeAgo(comment.created_at)}
                            </Text>
                          </View>
                          <Text style={[styles.commentContent, { color: colors.text }]}>
                            {comment.content}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noComments}>
                      <Text style={[styles.noCommentsText, { color: colors.secondary }]}>
                        No comments yet. Be the first to comment!
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.commentModal, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.commentHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.commentTitle, { color: colors.text }]}>Add Comment</Text>
              <TouchableOpacity 
                onPress={() => setShowCommentModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.commentContent}>
              <Text style={[styles.commentLabel, { color: colors.text }]}>Your comment:</Text>
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter your comment here..."
                placeholderTextColor={colors.secondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: colors.secondary }]}>{commentText.length}/500</Text>
            </View>
            
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleCommentModalSubmit}
              >
                <Text style={styles.submitButtonText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '80%',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  commentContent: {
    padding: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  commentActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsSection: {
    borderTopWidth: 1,
    padding: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addCommentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentsLoading: {
    padding: 20,
    alignItems: 'center',
  },
  commentsLoadingText: {
    fontSize: 14,
  },
  commentsList: {
    gap: 8,
  },
  commentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentUserHandle: {
    fontSize: 12,
  },
  commentTime: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  noComments: {
    padding: 20,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  incidentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NewsView;