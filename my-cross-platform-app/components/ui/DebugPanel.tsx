import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Session } from '@supabase/supabase-js';

interface DebugPanelProps {
  session: Session | null;
  userProfile: any;
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ session, userProfile, visible, onClose }: DebugPanelProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Status</Text>
            <Text style={styles.infoText}>
              Has Session: {session ? '✅ Yes' : '❌ No'}
            </Text>
            {session && (
              <>
                <Text style={styles.infoText}>
                  User ID: {session.user?.id || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                  Email: {session.user?.email || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                  Email Verified: {session.user?.email_confirmed_at ? '✅ Yes' : '❌ No'}
                </Text>
                <Text style={styles.infoText}>
                  Session Expires: {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}
                </Text>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Status</Text>
            <Text style={styles.infoText}>
              Has Profile: {userProfile ? '✅ Yes' : '❌ No'}
            </Text>
            {userProfile && (
              <>
                <Text style={styles.infoText}>
                  Username: {userProfile.username || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                  Full Name: {userProfile.full_name || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                  User Type: {userProfile.user_type || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                  Phone: {userProfile.phone_number || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                  Created: {userProfile.created_at ? new Date(userProfile.created_at).toLocaleString() : 'N/A'}
                </Text>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Raw Data</Text>
            <Text style={styles.rawText}>
              Session: {JSON.stringify(session, null, 2)}
            </Text>
            <Text style={styles.rawText}>
              Profile: {JSON.stringify(userProfile, null, 2)}
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  rawText: {
    fontSize: 10,
    color: '#737373',
    fontFamily: 'monospace',
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
});
