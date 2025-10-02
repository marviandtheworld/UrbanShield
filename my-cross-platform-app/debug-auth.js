// Debug script to test authentication flow
// Run this in your browser console or as a standalone script

const SUPABASE_URL = 'https://jphydwbpizcmltrehuyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaHlkd2JwaXpjbWx0cmVodXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDYyMDQsImV4cCI6MjA3NDY4MjIwNH0.LBscRvA_Y-xKVD27UphJYXr62cmapUMr-yZcgzd4bG8';

// Test authentication functions
async function testAuth() {
  console.log('🔍 Testing authentication flow...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('🔍 Test 1: Checking Supabase connection...');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test 2: Check profiles table
    console.log('🔍 Test 2: Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log('Profiles query result:', { profiles, error: profilesError });
    
    // Test 3: Check auth users
    console.log('🔍 Test 3: Checking auth users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    console.log('Auth users result:', { users: users?.length || 0, error: usersError });
    
    // Test 4: Try to sign up a test user
    console.log('🔍 Test 4: Testing signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          username: `testuser${Date.now()}`,
        },
      },
    });
    
    console.log('Signup result:', { 
      user: !!signupData.user, 
      error: signupError,
      userId: signupData.user?.id 
    });
    
    if (signupData.user) {
      // Test 5: Check if profile was created
      console.log('🔍 Test 5: Checking if profile was created...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();
      
      console.log('Profile check result:', { profile, error: profileError });
      
      // Test 6: Try to sign in
      console.log('🔍 Test 6: Testing signin...');
      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      console.log('Signin result:', { 
        user: !!signinData.user, 
        session: !!signinData.session, 
        error: signinError 
      });
      
      // Clean up test user
      console.log('🔍 Cleaning up test user...');
      await supabase.auth.signOut();
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuth();
