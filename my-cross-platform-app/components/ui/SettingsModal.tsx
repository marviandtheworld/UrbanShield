import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import UrbanShieldApp from './UrbanShieldApp';

const { width } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: any;
  onProfileUpdate: () => void;
}

type SettingsTab = 'appearance' | 'profile' | 'notifications';

export default function SettingsModal({
  visible,
  onClose,
  userProfile,
  onProfileUpdate,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [loading, setLoading] = useState(false);

  // Appearance settings
  const [isDarkMode, setIsDarkMode] = useState(true); // App currently only dark mode

  // Profile settings
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '');

  // Notification settings (UI only for now)
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userProfile?.notifications_enabled ?? true
  );
  const [incidentUpdates, setIncidentUpdates] = useState(true);
  const [commentReplies, setCommentReplies] = useState(true);
  const [nearbyAlerts, setNearbyAlerts] = useState(true);

  const handleUpdateProfile = async () => {
    if (!fullName.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and username are required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username.trim(),
          phone_number: phoneNumber.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      onProfileUpdate();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notifications_enabled: notificationsEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      Alert.alert('Success', 'Notification settings updated!');
      onProfileUpdate();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderAppearanceTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Theme</Text>
      <Text style={styles.sectionDescription}>
        Customize how UrbanShield looks on your device
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="moon" size={24} color="#ef4444" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              {isDarkMode ? 'Currently active' : 'Use light theme'}
            </Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{ false: '#525252', true: '#ef4444' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#737373" />
        <Text style={styles.infoText}>
          Light mode coming soon! Dark mode is optimized for battery life and night viewing.
        </Text>
      </View>
    </View>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.sectionDescription}>
        Update your profile details
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor="#525252"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Choose a username"
        placeholderTextColor="#525252"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+63 XXX XXX XXXX"
        placeholderTextColor="#525252"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark" size={20} color="#737373" />
        <Text style={styles.infoText}>
          Email cannot be changed. Contact support if you need to update it.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <Text style={styles.sectionDescription}>
        Manage how you receive updates
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={24} color="#ef4444" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Master switch for all notifications
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#525252', true: '#ef4444' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
        Notification Types
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="refresh" size={20} color="#737373" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Incident Updates</Text>
            <Text style={styles.settingDescription}>
              When reports you follow are updated
            </Text>
          </View>
        </View>
        <Switch
          value={incidentUpdates}
          onValueChange={setIncidentUpdates}
          disabled={!notificationsEnabled}
          trackColor={{ false: '#525252', true: '#ef4444' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="chatbubble" size={20} color="#737373" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Comment Replies</Text>
            <Text style={styles.settingDescription}>
              When someone replies to your comments
            </Text>
          </View>
        </View>
        <Switch
          value={commentReplies}
          onValueChange={setCommentReplies}
          disabled={!notificationsEnabled}
          trackColor={{ false: '#525252', true: '#ef4444' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="location" size={20} color="#737373" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Nearby Alerts</Text>
            <Text style={styles.settingDescription}>
              Critical incidents near your location
            </Text>
          </View>
        </View>
        <Switch
          value={nearbyAlerts}
          onValueChange={setNearbyAlerts}
          disabled={!notificationsEnabled}
          trackColor={{ false: '#525252', true: '#ef4444' }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleUpdateNotifications}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'appearance' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('appearance')}
            >
              <Ionicons
                name="color-palette"
                size={20}
                color={activeTab === 'appearance' ? '#ef4444' : '#737373'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'appearance' && styles.tabTextActive,
                ]}
              >
                Appearance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'profile' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('profile')}
            >
              <Ionicons
                name="person"
                size={20}
                color={activeTab === 'profile' ? '#ef4444' : '#737373'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'profile' && styles.tabTextActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'notifications' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('notifications')}
            >
              <Ionicons
                name="notifications"
                size={20}
                color={activeTab === 'notifications' ? '#ef4444' : '#737373'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'notifications' && styles.tabTextActive,
                ]}
              >
                Notifications
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '90%',
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#ef4444',
  },
  tabText: {
    fontSize: 14,
    color: '#737373',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ef4444',
  },
  scrollContent: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#737373',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#737373',
    marginLeft: 8,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 24,
  },
});

