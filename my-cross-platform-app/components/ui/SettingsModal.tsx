import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

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
  const { themeMode, isDark, setThemeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [loading, setLoading] = useState(false);

  // Appearance settings
  const [isDarkMode, setIsDarkMode] = useState(isDark);

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

  // Update local state when theme changes
  useEffect(() => {
    setIsDarkMode(isDark);
  }, [isDark]);

  const handleThemeChange = (newIsDark: boolean) => {
    setIsDarkMode(newIsDark);
    setThemeMode(newIsDark ? 'dark' : 'light');
  };

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

  const renderAppearanceTab = () => {
    const colors = Colors[isDark ? 'dark' : 'light'];
    
    return (
      <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
        <Text style={[styles.sectionDescription, { color: colors.secondary }]}>
          Customize how UrbanShield looks on your device
        </Text>

        <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                {isDarkMode ? 'Currently active' : 'Use light theme'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="sunny" size={24} color={colors.warning} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Light Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                {!isDarkMode ? 'Currently active' : 'Use light theme'}
              </Text>
            </View>
          </View>
          <Switch
            value={!isDarkMode}
            onValueChange={(value) => handleThemeChange(!value)}
            trackColor={{ false: colors.border, true: colors.warning }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.info + '20' }]}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.secondary }]}>
            Choose your preferred theme. Light mode is great for daytime use, while dark mode saves battery and is easier on the eyes at night.
          </Text>
        </View>
      </View>
    );
  };

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

  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'appearance' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab('appearance')}
            >
              <Ionicons
                name="color-palette"
                size={20}
                color={activeTab === 'appearance' ? colors.primary : colors.secondary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'appearance' ? colors.primary : colors.secondary },
                  activeTab === 'appearance' && styles.tabTextActive,
                ]}
              >
                Appearance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'profile' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab('profile')}
            >
              <Ionicons
                name="person"
                size={20}
                color={activeTab === 'profile' ? colors.primary : colors.secondary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'profile' ? colors.primary : colors.secondary },
                  activeTab === 'profile' && styles.tabTextActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'notifications' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab('notifications')}
            >
              <Ionicons
                name="notifications"
                size={20}
                color={activeTab === 'notifications' ? colors.primary : colors.secondary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'notifications' ? colors.primary : colors.secondary },
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

