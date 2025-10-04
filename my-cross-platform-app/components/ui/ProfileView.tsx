import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleLogout = async () => {
    try {
      await authService.signOut();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: isDark ? 'rgba(127, 29, 29, 0.2)' : colors.accent }]}>
          {/* Settings/Logout Button */}
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={session ? onOpenSettings : onAuthRequired}
          >
            <Ionicons 
              name={session ? "settings-outline" : "log-in-outline"} 
              size={20} 
              color={colors.icon} 
            />
          </TouchableOpacity>

          {/* Logout Button (separate from settings) */}
          {session && (
            <TouchableOpacity 
              style={[styles.settingsButton, { right: 70, backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleLogout}
            >
              <Ionicons 
                name="log-out-outline" 
                size={20} 
                color={colors.icon} 
              />
            </TouchableOpacity>
          )}

          <View style={styles.profileInfo}>
            <View style={styles.profileAvatarContainer}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary, borderColor: isDark ? 'rgba(127, 29, 29, 0.5)' : colors.accentBorder }]}>
                <Ionicons name="person" size={48} color={colors.background} />
              </View>
              {session && (
                <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera" size={20} color={colors.background} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.profileName, { color: colors.text }]}>
              {userProfile ? userProfile.full_name : 'Guest User'}
            </Text>
            <Text style={[styles.profileHandle, { color: colors.textSecondary }]}>
              {userProfile ? `@${userProfile.username}` : 'Login to continue'}
            </Text>
            {userProfile && (
              <View style={[styles.accountBadge, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : colors.accent, borderColor: colors.primary }]}>
                <Text style={[styles.accountBadgeText, { color: colors.primary }]}>
                  {userProfile.user_type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
            {!session && (
              <TouchableOpacity 
                style={[styles.loginPromptButton, { backgroundColor: colors.primary }]}
                onPress={onAuthRequired}
              >
                <Text style={[styles.loginPromptText, { color: colors.background }]}>Login / Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {session && userProfile && (
          <>
            {/* Daily Streak Section */}
            <View style={[styles.streakSection, { backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : colors.accent, borderBottomColor: colors.border }]}>
              <View style={styles.streakHeader}>
                <View style={styles.streakTitleContainer}>
                  <View style={[styles.streakIconBox, { backgroundColor: colors.primary }]}>
                    <Ionicons name="flame" size={20} color={colors.background} />
                  </View>
                  <Text style={[styles.streakTitle, { color: colors.text }]}>Daily Streak</Text>
                </View>
                <Text style={[styles.streakCount, { color: colors.primary }]}>
                  {userProfile.streak_days || 0} days
                </Text>
              </View>
              <View style={styles.streakDays}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <View key={i} style={[
                    styles.streakDay,
                    i < (userProfile.streak_days % 7) 
                      ? { backgroundColor: colors.primary } 
                      : { backgroundColor: colors.surface }
                  ]}>
                    <Text style={[
                      styles.streakDayText,
                      i < (userProfile.streak_days % 7) 
                        ? { color: colors.background } 
                        : { color: colors.textMuted }
                    ]}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumberRed, { color: colors.primary }]}>
                  {userProfile.reports_filed || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reports Filed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumberWhite, { color: colors.text }]}>
                  {userProfile.reports_resolved || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Resolved</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumberGray, { color: colors.textMuted }]}>
                  {(userProfile.reports_filed || 0) - (userProfile.reports_resolved || 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
              </View>
            </View>

            {/* Today's Activity */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}> Today's Activity</Text>
              </View>

              <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityTitleContainer}>
                    <View style={[styles.activityDotRed, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.activityTitle, { color: colors.text }]}>Streetlight Repair</Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textMuted }]}>2 hrs ago</Text>
                </View>
                <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>
                  Oak Street & 5th Ave - Status updated to "In Progress"
                </Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[styles.progressFill, { width: '75%', backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textMuted }]}>75%</Text>
                </View>
              </View>

              <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityTitleContainer}>
                    <View style={[styles.activityDotGreen, { backgroundColor: colors.success }]} />
                    <Text style={[styles.activityTitle, { color: colors.text }]}>Playground Safety</Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textMuted }]}>5 hrs ago</Text>
                </View>
                <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>
                  Lincoln Park - Marked as "Resolved"
                </Text>
                <Text style={[styles.completedText, { color: colors.success }]}>✓ Completed</Text>
              </View>
            </View>

            {/* This Week's Impact */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}> This Week's Impact</Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Area Covered</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>2.3 km²</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Response Time</Text>
                    <Text style={[styles.summaryValueRed, { color: colors.primary }]}>4.2 hrs</Text>
                  </View>
                </View>

                <View style={styles.summaryList}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryRowLabel, { color: colors.textSecondary }]}>Safety Issues</Text>
                    <Text style={[styles.summaryRowValue, { color: colors.text }]}>8 reports</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryRowLabel, { color: colors.textSecondary }]}>Maintenance</Text>
                    <Text style={[styles.summaryRowValue, { color: colors.text }]}>5 reports</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryRowLabel, { color: colors.textSecondary }]}>Community Help</Text>
                    <Text style={[styles.summaryRowValue, { color: colors.text }]}>2 reports</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy" size={20} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}> Badges Earned</Text>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.badgesContainer}
              >
                <View style={styles.badge}>
                  <View style={[styles.badgeIconActive, { backgroundColor: colors.primary }]}>
                    <Ionicons name="star" size={32} color={colors.background} />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Community{"\n"}Hero</Text>
                </View>
                <View style={styles.badge}>
                  <View style={[styles.badgeIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name="flame" size={32} color={colors.icon} />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Week{"\n"}Streak</Text>
                </View>
                <View style={styles.badge}>
                  <View style={[styles.badgeIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name="eye" size={32} color={colors.icon} />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Watchful{"\n"}Eye</Text>
                </View>
                <View style={styles.badge}>
                  <View style={[styles.badgeIconLocked, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed" size={32} color={colors.textMuted} />
                  </View>
                  <Text style={[styles.badgeLabelLocked, { color: colors.textMuted }]}>Locked</Text>
                </View>
              </ScrollView>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
              <TouchableOpacity style={[styles.tabActive, { borderBottomColor: colors.primary }]}>
                <Text style={[styles.tabTextActive, { color: colors.text }]}>All Reports</Text>
                <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={[styles.tabText, { color: colors.textSecondary }]}>Saved</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={[styles.tabText, { color: colors.textSecondary }]}>Following</Text>
              </TouchableOpacity>
            </View>

            {/* Reports Grid */}
            <View style={styles.reportsGrid}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.reportCardText, { color: colors.textMuted }]}>#{23 - i}</Text>
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
  },
  profileHeader: {
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderWidth: 1,
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
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 14,
    marginBottom: 8,
  },
  accountBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  accountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginPromptButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginPromptText: {
    fontWeight: '600',
    fontSize: 14,
  },
  streakSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
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
  streakDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumberRed: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statNumberWhite: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statNumberGray: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
  },
  activityCard: {
    borderWidth: 1,
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
    borderRadius: 4,
    marginRight: 8,
  },
  activityDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
  },
  activityDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    borderWidth: 1,
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
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryValueRed: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },
  summaryRowValue: {
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconActive: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconLocked: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    fontSize: 12,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '100%',
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  reportCard: {
    width: (width - 16) / 3,
    aspectRatio: 1,
    borderWidth: 1,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCardText: {
    fontSize: 12,
    marginTop: 4,
  },
});