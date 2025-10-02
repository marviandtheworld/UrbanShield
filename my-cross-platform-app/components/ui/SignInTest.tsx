import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { authService } from '../../lib/authService';
import { supabase } from '../../lib/supabase';

export default function SignInTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    clearResults();
    
    try {
      addResult('🔍 Starting sign-in test...');
      addResult(`📧 Email: ${email}`);
      addResult(`🔑 Has password: ${!!password}`);

      // Test 1: Check if user exists in auth.users (we can't check profiles by email yet)
      addResult('🔍 Test 1: Checking auth users...');
      addResult('Note: Cannot check profiles by email (column may not exist)');
      
      // We'll check profiles after we get the user ID from auth

      // Test 2: Try to sign in
      addResult('🔍 Test 2: Attempting sign in...');
      
      try {
        const result = await authService.signIn(email, password);
        addResult('✅ Sign in successful!');
        addResult(`User ID: ${result.data.user?.id}`);
        addResult(`Email confirmed: ${!!result.data.user?.email_confirmed_at}`);
      } catch (signInError) {
        addResult(`❌ Sign in failed: ${signInError.message}`);
        
        if (signInError.code === 'email_not_confirmed') {
          addResult('🚨 ISSUE: Email not confirmed!');
          addResult('💡 SOLUTION: Go to Supabase Dashboard → Authentication → Settings');
          addResult('💡 Turn OFF "Enable email confirmations"');
          addResult('💡 OR confirm your email manually in Supabase Dashboard');
        }
        
        throw signInError; // Re-throw to stop the test
      }

      // Test 3: Check session
      addResult('🔍 Test 3: Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      addResult(`Session exists: ${!!session}`);
      if (session) {
        addResult(`Session user ID: ${session.user.id}`);
      }

      // Test 4: Check profile after sign in
      addResult('🔍 Test 4: Checking profile after sign in...');
      if (result.data.user) {
        const { data: profile, error: profileError2 } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', result.data.user.id)
          .single();
        
        addResult(`Profile after sign in: ${profile ? 'Found' : 'Not found'}`);
        if (profileError2) {
          addResult(`Profile error after sign in: ${profileError2.message}`);
        }
      }

    } catch (error) {
      addResult(`❌ Sign in failed: ${error.message}`);
      addResult(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    clearResults();
    
    try {
      addResult('🔍 Starting sign-up test...');
      
      const testData = {
        email,
        password,
        fullName: 'Test User',
        username: `testuser${Date.now()}`,
        userType: 'community_member' as const,
      };

      addResult(`Test data: ${JSON.stringify(testData, null, 2)}`);

      const result = await authService.signUp(testData);
      addResult('✅ Sign up successful!');
      addResult(`User ID: ${result.data.user?.id}`);

    } catch (error) {
      addResult(`❌ Sign up failed: ${error.message}`);
      addResult(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In Test</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={testSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sign Up</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearResults}
      >
        <Text style={styles.buttonText}>Clear Results</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.results}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  signupButton: {
    backgroundColor: '#10B981',
  },
  clearButton: {
    backgroundColor: '#6B7280',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
