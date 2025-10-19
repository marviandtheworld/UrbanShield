import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { UserType, getUserTypeConfig, hasPermission } from '../../lib/userTypes';

interface UserTypeDashboardProps {
  userType: UserType;
  userProfile: any;
  onNavigate: (tab: string) => void;
}

export default function UserTypeDashboard({ userType, userProfile, onNavigate }: UserTypeDashboardProps) {
  const { isDark, colors } = useTheme();
  const config = getUserTypeConfig(userType);

  // Emergency hotlines data
  const emergencyHotlines = [
    {
      name: 'CITY DISASTER RISK REDUCTION MANAGEMENT OFFICE',
      numbers: ['411-2222', 'GLOBE 0917-821-2842', 'SMART: 0998-598-2405'],
      icon: 'warning',
      color: '#ef4444'
    },
    {
      name: 'TAGBILARAN CITY POLICE STATION',
      numbers: ['412-1452', '0950-124-4517'],
      icon: 'shield',
      color: '#3b82f6'
    },
    {
      name: 'TAGBILARAN CITY FIRE STATION',
      numbers: ['422-8362 / 235-3911', 'TM: 0965-320-3000', 'SMART: 0948-984-7487'],
      icon: 'flame',
      color: '#ff6b35'
    },
    {
      name: 'TARSIER 117',
      numbers: ['412-0960 / 501-8116', '0919-069-4429'],
      icon: 'call',
      color: '#10b981'
    },
    {
      name: 'TEST NUMBER',
      numbers: ['09473833431'],
      icon: 'phone-portrait',
      color: '#8b5cf6'
    }
  ];

  const handleCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const phoneUrl = `tel:${cleanNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', `Failed to make call: ${err.message}`);
      });
  };

  const renderQuickAction = (title: string, icon: string, onPress: () => void, enabled: boolean = true) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }, !enabled && styles.disabledAction]}
      onPress={onPress}
      disabled={!enabled}
    >
      <Ionicons name={icon as any} size={24} color={enabled ? config.color : colors.secondary} />
      <Text style={[styles.quickActionText, { color: colors.text }, !enabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderEmergencyHotline = (hotline: any, index: number) => (
    <View key={index} style={[styles.hotlineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.hotlineHeader}>
        <View style={[styles.hotlineIcon, { backgroundColor: hotline.color }]}>
          <Ionicons name={hotline.icon as any} size={20} color="#fff" />
        </View>
        <Text style={[styles.hotlineName, { color: colors.text }]}>{hotline.name}</Text>
      </View>
      <View style={styles.hotlineNumbers}>
        {hotline.numbers.map((number: string, numIndex: number) => (
          <TouchableOpacity
            key={numIndex}
            style={[styles.phoneButton, { backgroundColor: colors.primary }]}
            onPress={() => handleCall(number)}
          >
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.phoneText}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderLeftColor: config.color }]}>
        <View style={styles.welcomeHeader}>
          <Ionicons name={config.icon as any} size={32} color={config.color} />
          <View style={styles.welcomeText}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome, {userProfile?.full_name || 'User'}!</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>{config.description}</Text>
          </View>
        </View>
      </View>

      {/* Emergency Hotlines */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Hotlines</Text>
        <View style={styles.hotlinesContainer}>
          {emergencyHotlines.map(renderEmergencyHotline)}
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

      {/* Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.reports_filed || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reports Filed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.reports_resolved || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reports Resolved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.streak_days || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userProfile?.reputation_score || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reputation</Text>
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
    opacity: 0.5,
  },
  hotlinesContainer: {
    gap: 12,
  },
  hotlineCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  hotlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hotlineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotlineName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  hotlineNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  phoneText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
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

