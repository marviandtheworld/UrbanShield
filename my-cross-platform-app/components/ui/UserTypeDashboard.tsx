import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { UserType, getUserTypeConfig, hasPermission } from '../../lib/userTypes';

interface UserTypeDashboardProps {
  userType: UserType;
  userProfile: any;
  onNavigate: (tab: string) => void;
}

export default function UserTypeDashboard({ userType, userProfile, onNavigate }: UserTypeDashboardProps) {
  const { isDark, setThemeMode } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const config = getUserTypeConfig(userType);

  const renderFeatureCard = (feature: string, index: number) => (
    <TouchableOpacity key={index} style={[styles.featureCard, { backgroundColor: colors.card }]}>
      <Ionicons name="checkmark-circle" size={20} color={config.color} />
      <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (title: string, icon: string, onPress: () => void, enabled: boolean = true) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }, !enabled && styles.disabledAction]}
      onPress={onPress}
      disabled={!enabled}
    >
      <Ionicons name={icon as any} size={24} color={enabled ? config.color : colors.secondary} />
      <Text style={[styles.quickActionText, { color: enabled ? colors.text : colors.secondary }, !enabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Theme Toggle */}
      <View style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.surface }]}
          onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
        >
          <Ionicons 
            name={isDark ? "sunny" : "moon"} 
            size={20} 
            color={colors.text} 
          />
          <Text style={[styles.themeText, { color: colors.text }]}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderLeftColor: config.color }]}>
        <View style={styles.welcomeHeader}>
          <Ionicons name={config.icon as any} size={32} color={config.color} />
          <View style={styles.welcomeText}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome, {userProfile?.full_name || 'User'}!</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.secondary }]}>{config.description}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {renderQuickAction(
            'Report Incident',
            'add-circle',
            () => onNavigate('create-incident'),
            hasPermission(userType, 'canCreateIncidents')
          )}
          {renderQuickAction(
            'View Incidents',
            'list',
            () => onNavigate('incidents'),
            hasPermission(userType, 'canViewAllIncidents')
          )}
          {renderQuickAction(
            'Analytics',
            'analytics',
            () => onNavigate('analytics'),
            hasPermission(userType, 'canAccessAnalytics')
          )}
          {renderQuickAction(
            'Live Stream',
            'videocam',
            () => onNavigate('live'),
            hasPermission(userType, 'canAccessLiveStream')
          )}
          {renderQuickAction(
            'Announcements',
            'megaphone',
            () => onNavigate('announcements'),
            hasPermission(userType, 'canCreateAnnouncements')
          )}
          {renderQuickAction(
            'User Management',
            'people',
            () => onNavigate('users'),
            hasPermission(userType, 'canManageUsers')
          )}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Features</Text>
        <View style={styles.featuresList}>
          {config.features.map(renderFeatureCard)}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.reports_filed || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Reports Filed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.reports_resolved || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Reports Resolved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.streak_days || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.reputation_score || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Reputation</Text>
          </View>
        </View>
      </View>

      {/* User Type Specific Content */}
      {userType === 'parent' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Child Safety</Text>
          <View style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="school" size={24} color={config.color} />
            <Text style={[styles.specialCardText, { color: colors.text }]}>Monitor school zone safety and receive alerts about incidents near your child's school.</Text>
          </View>
        </View>
      )}

      {userType === 'business' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Safety</Text>
          <View style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="business" size={24} color={config.color} />
            <Text style={[styles.specialCardText, { color: colors.text }]}>Track crime statistics in your business area and create safety announcements for customers.</Text>
          </View>
        </View>
      )}

      {userType === 'government' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Public Safety Management</Text>
          <View style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark" size={24} color={config.color} />
            <Text style={[styles.specialCardText, { color: colors.text }]}>Access comprehensive analytics and manage public safety initiatives across the community.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  themeToggle: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
  },
  disabledAction: {
    opacity: 0.5,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.6,
  },
  featuresList: {
    gap: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  specialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  specialCardText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

