import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from '../../lib/authService';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UserType = 'parent' | 'resident' | 'business' | 'government' | 'tourist' | 'guest';

export default function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup fields
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    phoneNumber: '',
    userType: 'community_member' as UserType,
    address: '',
    city: '',
    state: '',
    organizationName: '',
    organizationType: '',
    businessLicense: '',
  });

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setSignupData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      username: '',
      phoneNumber: '',
      userType: 'community_member',
      address: '',
      city: '',
      state: '',
      organizationName: '',
      organizationType: '',
      businessLicense: '',
    });
  };

  const handleLogin = async () => {
    console.log('🔍 Login attempt started');
    console.log('🔍 Login data:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      console.log('❌ Login validation failed: missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Calling authService.signIn...');
      const result = await authService.signIn(email, password);
      console.log('✅ Login successful:', result);
      
      // Wait a moment for the auth state to update
      console.log('🔍 Waiting for auth state to update...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔍 Calling onSuccess callback...');
      onSuccess();
      
      console.log('🔍 Closing modal and resetting form...');
      onClose();
      resetForm();
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name
      });
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Login failed: ${error.code}`;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    console.log('🔍 Signup attempt started');
    const { email, password, confirmPassword, fullName, username, userType } = signupData;
    
    console.log('🔍 Signup data validation:', {
      email: !!email,
      password: !!password,
      fullName: !!fullName,
      username: !!username,
      userType
    });
    
    if (!email || !password || !fullName || !username) {
      console.log('❌ Signup validation failed: missing required fields');
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Signup validation failed: passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.log('❌ Signup validation failed: password too short');
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Calling authService.signUp...');
      const result = await authService.signUp({
        email,
        password,
        fullName,
        username,
        phoneNumber: signupData.phoneNumber || undefined,
        userType: userType as UserType,
        address: signupData.address || undefined,
        city: signupData.city || undefined,
        state: signupData.state || undefined,
        organizationName: signupData.organizationName || undefined,
        organizationType: signupData.organizationType || undefined,
        businessLicense: signupData.businessLicense || undefined,
      });
      
      console.log('✅ Signup successful:', result);
      Alert.alert('Success', 'Account created successfully! You can now sign in.');
      setIsLogin(true);
      resetForm();
    } catch (error) {
      console.error('❌ Signup failed:', error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLogin ? (
            // Login Form
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#737373"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#737373"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          ) : (
            // Signup Form
            <>
              <Text style={styles.sectionTitle}>Account Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                placeholderTextColor="#737373"
                value={signupData.fullName}
                onChangeText={(text) => setSignupData({...signupData, fullName: text})}
                autoCapitalize="words"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Username *"
                placeholderTextColor="#737373"
                value={signupData.username}
                onChangeText={(text) => setSignupData({...signupData, username: text})}
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#737373"
                value={signupData.email}
                onChangeText={(text) => setSignupData({...signupData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password *"
                placeholderTextColor="#737373"
                value={signupData.password}
                onChangeText={(text) => setSignupData({...signupData, password: text})}
                secureTextEntry
              />
              
              <TextInput
                style={styles.input}
                placeholder="Confirm Password *"
                placeholderTextColor="#737373"
                value={signupData.confirmPassword}
                onChangeText={(text) => setSignupData({...signupData, confirmPassword: text})}
                secureTextEntry
              />
              
              <Text style={styles.sectionTitle}>User Type</Text>
              
              <View style={styles.userTypeContainer}>
                {(['parent', 'resident', 'business', 'government', 'tourist', 'guest'] as UserType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.userTypeButton,
                      signupData.userType === type && styles.userTypeButtonActive
                    ]}
                    onPress={() => setSignupData({...signupData, userType: type})}
                  >
                    <Text style={[
                      styles.userTypeText,
                      signupData.userType === type && styles.userTypeTextActive
                    ]}>
                      {type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#737373"
                value={signupData.phoneNumber}
                onChangeText={(text) => setSignupData({...signupData, phoneNumber: text})}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#737373"
                value={signupData.address}
                onChangeText={(text) => setSignupData({...signupData, address: text})}
                multiline
              />
              
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City"
                  placeholderTextColor="#737373"
                  value={signupData.city}
                  onChangeText={(text) => setSignupData({...signupData, city: text})}
                />
                
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="State"
                  placeholderTextColor="#737373"
                  value={signupData.state}
                  onChangeText={(text) => setSignupData({...signupData, state: text})}
                />
              </View>
              
              {(signupData.userType === 'business' || signupData.userType === 'government') && (
                <>
                  <Text style={styles.sectionTitle}>Organization Details</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Organization Name"
                    placeholderTextColor="#737373"
                    value={signupData.organizationName}
                    onChangeText={(text) => setSignupData({...signupData, organizationName: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Organization Type"
                    placeholderTextColor="#737373"
                    value={signupData.organizationType}
                    onChangeText={(text) => setSignupData({...signupData, organizationType: text})}
                  />
                  
                  {signupData.userType === 'business' && (
                    <TextInput
                      style={styles.input}
                      placeholder="Business License Number"
                      placeholderTextColor="#737373"
                      value={signupData.businessLicense}
                      onChangeText={(text) => setSignupData({...signupData, businessLicense: text})}
                    />
                  )}
                </>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
          >
            <Text style={styles.switchText}>
              {isLogin 
                ? "Don't have an account? Create Account" 
                : "Already have an account? Sign In"
              }
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  userTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  userTypeButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  userTypeText: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: '#fff',
  },
  authButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  switchText: {
    color: '#737373',
    fontSize: 14,
  },
});

