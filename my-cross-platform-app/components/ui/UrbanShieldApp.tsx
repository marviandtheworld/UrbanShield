// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

import { UserType } from '../../lib/userTypes';

// Import all components for both platforms
const AuthModal = require('./AuthModal').default;
const ChatBot = require('./ChatBot').default;
const CreateIncidentModal = require('./CreateIncidentModal').default;
const DebugPanel = require('./DebugPanel').default;
const GuestHomeboard = require('./GuestHomeboard').default;
const NewsView = require('./NewsView').default;
const ProfileView = require('./ProfileView').default;
const SettingsModal = require('./SettingsModal').default;
const UserTypeDashboard = require('./UserTypeDashboard').default;

// Import SafetyMap for all platforms
const SafetyMap = require('./SafetyMap').default;


type ViewType = 'dashboard' | 'map' | 'news' | 'profile';

export default function UrbanShieldApp() {
  console.log('🔍 UrbanShieldApp: Component rendering...');

  const { isDark, colors } = useTheme();
  console.log('🔍 UrbanShieldApp: Theme loaded, isDark:', isDark);

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [newsRefreshTrigger, setNewsRefreshTrigger] = useState(0);

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
    // Trigger refresh of news view
    setNewsRefreshTrigger(prev => prev + 1);
    // Switch to news view to show the new incident
    setActiveView('news');
  };

  console.log('🔍 UrbanShieldApp: Colors loaded:', { isDark, background: colors.background });

  // Use View for web, SafeAreaView for mobile
  const Container = Platform.OS === 'web' ? View : SafeAreaView;
  console.log('🔍 UrbanShieldApp: Platform:', Platform.OS, 'Container:', Container.name);

  console.log('🔍 UrbanShieldApp: About to render main component');

  return (
      <Container style={[styles.safeArea, { backgroundColor: colors.background as any }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Authentication Status Indicator */}
      {!session && (
        <View style={[styles.authStatusBar, { backgroundColor: colors.error as any }]}>
          <Text style={styles.authStatusText as any}>
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
      {activeView === 'dashboard' && !session && (
        <GuestHomeboard 
          onGetStarted={() => setShowAuthModal(true)}
        />
      )}
      {activeView === 'map' && (
        <SafetyMap 
          onIncidentSelect={(incident) => {
            console.log('Incident selected:', incident);
            // You can add navigation to incident details here
          }}
          showUserLocation={true}
        />
      )}
      {activeView === 'news' && (
        <NewsView 
          session={session}
          userProfile={userProfile}
          onAuthRequired={handleAuthRequired}
          refreshTrigger={newsRefreshTrigger}
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

      {/* Floating Action Button - Create Post */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreatePost}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Debug Button */}
      <TouchableOpacity 
        style={[styles.debugButton, { backgroundColor: colors.secondary }]}
        onPress={() => setShowDebugPanel(true)}
      >
        <Ionicons name="bug" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Chat Bot Button */}
      <TouchableOpacity 
        style={[styles.chatButton, { backgroundColor: colors.info }]}
        onPress={() => setShowChatBot(true)}
      >
        <Ionicons name="chatbubble" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('dashboard')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={activeView === 'dashboard' ? colors.primary : colors.secondary} 
          />
          <Text style={[
            styles.navText, 
            { color: activeView === 'dashboard' ? colors.primary : colors.secondary },
            activeView === 'dashboard' && styles.navTextActive
          ]}>
            Home
          </Text>
          {activeView === 'dashboard' && <View style={[styles.navIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('news')}
        >
          <Ionicons 
            name="newspaper" 
            size={24} 
            color={activeView === 'news' ? colors.primary : colors.secondary} 
          />
          <Text style={[
            styles.navText, 
            { color: activeView === 'news' ? colors.primary : colors.secondary },
            activeView === 'news' && styles.navTextActive
          ]}>
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
            color={activeView === 'map' ? colors.primary : colors.secondary} 
          />
          <Text style={[
            styles.navText, 
            { color: activeView === 'map' ? colors.primary : colors.secondary },
            activeView === 'map' && styles.navTextActive
          ]}>
            Map
          </Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveView('profile')}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color={activeView === 'profile' ? colors.primary : colors.secondary} 
          />
          <Text style={[
            styles.navText, 
            { color: activeView === 'profile' ? colors.primary : colors.secondary },
            activeView === 'profile' && styles.navTextActive
          ]}>
            Profile
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
                    userType={userProfile?.user_type as UserType}
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

      {/* Chat Bot */}
      <ChatBot
        visible={showChatBot}
        onClose={() => setShowChatBot(false)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: 600, // Use number instead of '100vh' for React Native compatibility
      width: '100%',
    }),
  },
  authStatusBar: {
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButton: {
    position: 'absolute',
    left: 20,
    bottom: 150,
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderTopWidth: 1,
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
    marginTop: 4,
  },
  navTextActive: {
    fontWeight: '600',
  },
  navIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 48,
    height: 4,
    borderRadius: 2,
  },
});