import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../lib/authService';

const { width } = Dimensions.get('window');

interface ProfileViewProps {
  session: any;
  userProfile: any;
  onAuthRequired: () => void;
  onOpenSettings: () => void;
  onProfileUpdate: () => void;
}

export default function ProfileView({
  session,
  userProfile,
  onAuthRequired,
  onOpenSettings,
  onProfileUpdate,
}: ProfileViewProps) {
  const handleLogout = async () => {
    try {
      await authService.signOut();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {/* Settings/Logout Button */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={session ? onOpenSettings : onAuthRequired}
          >
            <Ionicons 
              name={session ? "settings-outline" : "log-in-outline"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>

          {/* Logout Button (separate from settings) */}
          {session && (
            <TouchableOpacity 
              style={[styles.settingsButton, { right: 70 }]}
              onPress={handleLogout}
            >
              <Ionicons 
                name="log-out-outline" 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}

          <View style={styles.profileInfo}>
            <View style={styles.profileAvatarContainer}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
              {session && (
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.profileName}>
              {userProfile ? userProfile.full_name : 'Guest User'}
            </Text>
            <Text style={styles.profileHandle}>
              {userProfile ? `@${userProfile.username}` : 'Login to continue'}
            </Text>
            {userProfile && (
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>
                  {userProfile.user_type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
            {!session && (
              <TouchableOpacity 
                style={styles.loginPromptButton}
                onPress={onAuthRequired}
              >
                <Text style={styles.loginPromptText}>Login / Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {session && userProfile && (
          <>
            {/* Daily Streak Section */}
            <View style={styles.streakSection}>
              <View style={styles.streakHeader}>
                <View style={styles.streakTitleContainer}>
                  <View style={styles.streakIconBox}>
                    <Ionicons name="flame" size={20} color="#fff" />
                  </View>
                  <Text style={styles.streakTitle}>Daily Streak</Text>
                </View>
                <Text style={styles.streakCount}>
                  {userProfile.streak_days || 0} days
                </Text>
              </View>
              <View style={styles.streakDays}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <View key={i} style={[
                    styles.streakDay,
                    i < (userProfile.streak_days % 7) ? styles.streakDayActive : styles.streakDayInactive
                  ]}>
                    <Text style={[
                      styles.streakDayText,
                      i < (userProfile.streak_days % 7) ? styles.streakDayTextActive : styles.streakDayTextInactive
                    ]}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumberRed}>
                  {userProfile.reports_filed || 0}
                </Text>
                <Text style={styles.statLabel}>Reports Filed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumberWhite}>
                  {userProfile.reports_resolved || 0}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumberGray}>
                  {(userProfile.reports_filed || 0) - (userProfile.reports_resolved || 0)}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>

            {/* Today's Activity */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color="#ef4444" />
                <Text style={styles.sectionTitle}> Today's Activity</Text>
              </View>

              <View style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityTitleContainer}>
                    <View style={styles.activityDotRed} />
                    <Text style={styles.activityTitle}>Streetlight Repair</Text>
                  </View>
                  <Text style={styles.activityTime}>2 hrs ago</Text>
                </View>
                <Text style={styles.activityDescription}>
                  Oak Street & 5th Ave - Status updated to "In Progress"
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '75%' }]} />
                  </View>
                  <Text style={styles.progressText}>75%</Text>
                </View>
              </View>

              <View style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityTitleContainer}>
                    <View style={styles.activityDotGreen} />
                    <Text style={styles.activityTitle}>Playground Safety</Text>
                  </View>
                  <Text style={styles.activityTime}>5 hrs ago</Text>
                </View>
                <Text style={styles.activityDescription}>
                  Lincoln Park - Marked as "Resolved"
                </Text>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
            </View>

            {/* This Week's Impact */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color="#ef4444" />
                <Text style={styles.sectionTitle}> This Week's Impact</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryLabel}>Area Covered</Text>
                    <Text style={styles.summaryValue}>2.3 km²</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryLabel}>Response Time</Text>
                    <Text style={styles.summaryValueRed}>4.2 hrs</Text>
                  </View>
                </View>

                <View style={styles.summaryList}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Safety Issues</Text>
                    <Text style={styles.summaryRowValue}>8 reports</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Maintenance</Text>
                    <Text style={styles.summaryRowValue}>5 reports</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Community Help</Text>
                    <Text style={styles.summaryRowValue}>2 reports</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy" size={20} color="#fbbf24" />
                <Text style={styles.sectionTitle}> Badges Earned</Text>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.badgesContainer}
              >
                <View style={styles.badge}>
                  <View style={styles.badgeIconActive}>
                    <Ionicons name="star" size={32} color="#fff" />
                  </View>
                  <Text style={styles.badgeLabel}>Community{"\n"}Hero</Text>
                </View>
                <View style={styles.badge}>
                  <View style={styles.badgeIcon}>
                    <Ionicons name="flame" size={32} color="#fff" />
                  </View>
                  <Text style={styles.badgeLabel}>Week{"\n"}Streak</Text>
                </View>
                <View style={styles.badge}>
                  <View style={styles.badgeIcon}>
                    <Ionicons name="eye" size={32} color="#fff" />
                  </View>
                  <Text style={styles.badgeLabel}>Watchful{"\n"}Eye</Text>
                </View>
                <View style={styles.badge}>
                  <View style={styles.badgeIconLocked}>
                    <Ionicons name="lock-closed" size={32} color="#525252" />
                  </View>
                  <Text style={styles.badgeLabelLocked}>Locked</Text>
                </View>
              </ScrollView>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity style={styles.tabActive}>
                <Text style={styles.tabTextActive}>All Reports</Text>
                <View style={styles.tabIndicator} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={styles.tabText}>Saved</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={styles.tabText}>Following</Text>
              </TouchableOpacity>
            </View>

            {/* Reports Grid */}
            <View style={styles.reportsGrid}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.reportCard}>
                  <MaterialCommunityIcons name="file-document-outline" size={32} color="#525252" />
                  <Text style={styles.reportCardText}>#{23 - i}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  profileHeader: {
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 32,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    backgroundColor: '#ef4444',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(127, 29, 29, 0.5)',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 8,
  },
  accountBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  accountBadgeText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  loginPromptButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginPromptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  streakSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDay: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  streakDayActive: {
    backgroundColor: '#ef4444',
  },
  streakDayInactive: {
    backgroundColor: '#1a1a1a',
  },
  streakDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakDayTextActive: {
    color: '#fff',
  },
  streakDayTextInactive: {
    color: '#525252',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumberRed: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  statNumberWhite: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statNumberGray: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#737373',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityDotRed: {
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    marginRight: 8,
  },
  activityDotGreen: {
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#525252',
  },
  activityDescription: {
    fontSize: 12,
    color: '#737373',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  progressText: {
    fontSize: 12,
    color: '#525252',
  },
  completedText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  summaryStat: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#737373',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryValueRed: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  summaryList: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowLabel: {
    fontSize: 14,
    color: '#737373',
  },
  summaryRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  badgesContainer: {
    paddingRight: 16,
  },
  badge: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#262626',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconActive: {
    width: 64,
    height: 64,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconLocked: {
    width: 64,
    height: 64,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  },
  badgeLabelLocked: {
    fontSize: 12,
    color: '#525252',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ef4444',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '100%',
    backgroundColor: '#ef4444',
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  reportCard: {
    width: (width - 16) / 3,
    aspectRatio: 1,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCardText: {
    fontSize: 12,
    color: '#525252',
    marginTop: 4,
  },
});