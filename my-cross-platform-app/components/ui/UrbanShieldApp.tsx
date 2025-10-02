import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

import AuthModal from './AuthModal';
import SettingsModal from './SettingsModal';
import CreateIncidentModal from './CreateIncidentModal';
import CustomMapView from './CustomMapView';
import NewsView from './NewsView';
import LiveView from './LiveView';
import ProfileView from './ProfileView';
import UserTypeDashboard from './UserTypeDashboard';
import DebugPanel from './DebugPanel';
import SignInTest from './SignInTest';
import { UserType } from '../../lib/userTypes';


type ViewType = 'dashboard' | 'map' | 'news' | 'live' | 'profile' | 'test';

export default function UrbanShieldApp() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    console.log('🔍 UrbanShieldApp: Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 Initial session check:', { session: !!session, error });
      if (error) {
        console.error('❌ Error getting initial session:', error);
      }
      setSession(session);
      if (session) {
        console.log('✅ Initial session found, loading profile for user:', session.user.id);
        loadUserProfile(session.user.id);
      } else {
        console.log('ℹ️ No initial session found');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state change:', { event, session: !!session, userId: session?.user?.id });
      
      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('ℹ️ User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
      
      setSession(session);
      if (session) {
        console.log('✅ Session available, loading profile for user:', session.user.id);
        loadUserProfile(session.user.id);
      } else {
        console.log('ℹ️ No session, clearing user profile');
        setUserProfile(null);
      }
    });

    return () => {
      console.log('🔍 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    console.log('🔍 Loading profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('🔍 Profile query result:', { data, error });
      
      if (error) {
        console.error('❌ Error loading profile:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Profile loaded successfully:', {
          id: data.id,
          username: data.username,
          user_type: data.user_type,
          full_name: data.full_name
        });
        setUserProfile(data);
      } else {
        console.warn('⚠️ No profile data returned for user:', userId);
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      // Don't throw here, just log the error
    }
  };

  const handleAuthRequired = (): boolean => {
    if (!session) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleCreatePost = () => {
    if (handleAuthRequired()) {
      setShowCreateModal(true);
    }
  };

  const handleAuthSuccess = () => {
    console.log('🔍 Auth success callback triggered');
    console.log('🔍 Current session state:', { session: !!session, userId: session?.user?.id });
    
    // Close the auth modal
    setShowAuthModal(false);
    
    // The profile will be loaded automatically by the auth state change listener
    // But let's also try to reload it manually as a fallback
    if (session) {
      console.log('🔍 Manually reloading profile after auth success');
      loadUserProfile(session.user.id);
    } else {
      console.warn('⚠️ No session available in auth success callback');
    }
  };

  const handleIncidentCreated = () => {
    // Refresh incidents feed or do any necessary updates
    console.log('New incident created');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Authentication Status Indicator */}
      {!session && (
        <View style={styles.authStatusBar}>
          <Text style={styles.authStatusText}>
            Not signed in - Tap any feature to sign in
          </Text>
        </View>
      )}

      {/* Main Views */}
      {activeView === 'dashboard' && session && userProfile && (
        <UserTypeDashboard 
          userType={userProfile.user_type as UserType}
          userProfile={userProfile}
          onNavigate={(tab) => {
            // Handle navigation based on tab
            switch(tab) {
              case 'create-incident':
                setShowCreateModal(true);
                break;
              case 'incidents':
                setActiveView('news');
                break;
              case 'live':
                setActiveView('live');
                break;
              case 'analytics':
                // TODO: Implement analytics view
                break;
              case 'announcements':
                // TODO: Implement announcements view
                break;
              case 'users':
                // TODO: Implement user management view
                break;
              default:
                break;
            }
          }}
        />
      )}
      {activeView === 'map' && (
        <CustomMapView 
          session={session}
          onAuthRequired={handleAuthRequired}
        />
      )}
      {activeView === 'news' && (
        <NewsView 
          session={session}
          userProfile={userProfile}
          onAuthRequired={handleAuthRequired}
        />
      )}
      {activeView === 'live' && (
        <LiveView 
          session={session}
          onAuthRequired={handleAuthRequired}
        />
      )}
      {activeView === 'profile' && (
        <ProfileView 
          session={session}
          userProfile={userProfile}
          onAuthRequired={() => setShowAuthModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onProfileUpdate={() => session && loadUserProfile(session.user.id)}
        />
      )}
      {activeView === 'test' && (
        <SignInTest />
      )}

      {/* Floating Action Button - Create Post */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreatePost}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Debug Button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={() => setShowDebugPanel(true)}
      >
        <Ionicons name="bug" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('dashboard')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={activeView === 'dashboard' ? '#fff' : '#525252'} 
          />
          <Text style={[styles.navText, activeView === 'dashboard' && styles.navTextActive]}>
            Home
          </Text>
          {activeView === 'dashboard' && <View style={styles.navIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('news')}
        >
          <Ionicons 
            name="newspaper" 
            size={24} 
            color={activeView === 'news' ? '#fff' : '#525252'} 
          />
          <Text style={[styles.navText, activeView === 'news' && styles.navTextActive]}>
            News
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('map')}
        >
          <Ionicons 
            name="map" 
            size={24} 
            color={activeView === 'map' ? '#fff' : '#525252'} 
          />
          <Text style={[styles.navText, activeView === 'map' && styles.navTextActive]}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('live')}
        >
          <Ionicons 
            name="videocam" 
            size={24} 
            color={activeView === 'live' ? '#fff' : '#525252'} 
          />
          <Text style={[styles.navText, activeView === 'live' && styles.navTextActive]}>
            Live
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('profile')}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color={activeView === 'profile' ? '#fff' : '#525252'} 
          />
          <Text style={[styles.navText, activeView === 'profile' && styles.navTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('test')}
        >
          <Ionicons 
            name="bug" 
            size={24} 
            color={activeView === 'test' ? '#fff' : '#525252'} 
          />
          <Text style={[styles.navText, activeView === 'test' && styles.navTextActive]}>
            Test
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AuthModal 
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {session && userProfile && (
        <>
          <SettingsModal
            visible={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            userProfile={userProfile}
            onProfileUpdate={() => loadUserProfile(session.user.id)}
          />

          <CreateIncidentModal
            visible={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            userId={session.user.id}
            onSuccess={handleIncidentCreated}
          />
        </>
      )}

      {/* Debug Panel */}
      <DebugPanel
        session={session}
        userProfile={userProfile}
        visible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  authStatusBar: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  authStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  debugButton: {
    position: 'absolute',
    left: 20,
    bottom: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navText: {
    fontSize: 12,
    color: '#525252',
    marginTop: 4,
  },
  navTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  navIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 48,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});