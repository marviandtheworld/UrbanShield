import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserType, getUserTypeConfig, hasPermission } from '../../lib/userTypes';

interface UserTypeDashboardProps {
  userType: UserType;
  userProfile: any;
  onNavigate: (tab: string) => void;
}

export default function UserTypeDashboard({ userType, userProfile, onNavigate }: UserTypeDashboardProps) {
  const config = getUserTypeConfig(userType);

  const renderFeatureCard = (feature: string, index: number) => (
    <TouchableOpacity key={index} style={styles.featureCard}>
      <Ionicons name="checkmark-circle" size={20} color={config.color} />
      <Text style={styles.featureText}>{feature}</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (title: string, icon: string, onPress: () => void, enabled: boolean = true) => (
    <TouchableOpacity
      style={[styles.quickAction, !enabled && styles.disabledAction]}
      onPress={onPress}
      disabled={!enabled}
    >
      <Ionicons name={icon as any} size={24} color={enabled ? config.color : '#6B7280'} />
      <Text style={[styles.quickActionText, !enabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={[styles.welcomeCard, { borderLeftColor: config.color }]}>
        <View style={styles.welcomeHeader}>
          <Ionicons name={config.icon as any} size={32} color={config.color} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome, {userProfile?.full_name || 'User'}!</Text>
            <Text style={styles.welcomeSubtitle}>{config.description}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
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
        <Text style={styles.sectionTitle}>Your Features</Text>
        <View style={styles.featuresList}>
          {config.features.map(renderFeatureCard)}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile?.reports_filed || 0}</Text>
            <Text style={styles.statLabel}>Reports Filed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile?.reports_resolved || 0}</Text>
            <Text style={styles.statLabel}>Reports Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile?.streak_days || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile?.reputation_score || 0}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
        </View>
      </View>

      {/* User Type Specific Content */}
      {userType === 'parent' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Safety</Text>
          <View style={styles.specialCard}>
            <Ionicons name="school" size={24} color={config.color} />
            <Text style={styles.specialCardText}>Monitor school zone safety and receive alerts about incidents near your child's school.</Text>
          </View>
        </View>
      )}

      {userType === 'business' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Safety</Text>
          <View style={styles.specialCard}>
            <Ionicons name="business" size={24} color={config.color} />
            <Text style={styles.specialCardText}>Track crime statistics in your business area and create safety announcements for customers.</Text>
          </View>
        </View>
      )}

      {userType === 'government' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Public Safety Management</Text>
          <View style={styles.specialCard}>
            <Ionicons name="shield-checkmark" size={24} color={config.color} />
            <Text style={styles.specialCardText}>Access comprehensive analytics and manage public safety initiatives across the community.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#737373',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  disabledAction: {
    opacity: 0.5,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  disabledText: {
    color: '#6B7280',
  },
  featuresList: {
    gap: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  featureText: {
    color: '#fff',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  },
  specialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  specialCardText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

