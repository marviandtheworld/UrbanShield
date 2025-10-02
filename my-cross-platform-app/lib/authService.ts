import { supabase } from './supabase';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phoneNumber?: string;
  userType?: 'parent' | 'business' | 'government' | 'community_member' | 'admin';
  address?: string;
  city?: string;
  state?: string;
  organizationName?: string;
  organizationType?: string;
  businessLicense?: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    console.log('🔍 authService.signUp called with data:', {
      email: data.email,
      username: data.username,
      userType: data.userType,
      hasPassword: !!data.password
    });

    // First, check if username already exists
    console.log('🔍 Checking if username exists:', data.username);
    const { data: existingUser, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', data.username)
      .single();

    console.log('🔍 Username check result:', { existingUser, error: usernameCheckError });

    if (existingUser) {
      console.log('❌ Username already taken');
      throw new Error('Username already taken. Please choose another one.');
    }

    // Sign up the user
    console.log('🔍 Creating auth user...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          username: data.username,
        },
      },
    });

    console.log('🔍 Auth signup result:', { 
      user: !!authData.user, 
      error: signUpError,
      userId: authData.user?.id 
    });

    if (signUpError) {
      console.error('❌ Auth signup failed:', signUpError);
      throw signUpError;
    }
    if (!authData.user) {
      console.error('❌ No user returned from auth signup');
      throw new Error('Failed to create user');
    }

    // Create profile
    console.log('🔍 Creating user profile...');
    const profileData = {
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
      username: data.username,
      phone_number: data.phoneNumber || null,
      user_type: data.userType || 'community_member',
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      organization_name: data.organizationName || null,
      organization_type: data.organizationType || null,
      business_license: data.businessLicense || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('🔍 Profile data to insert:', profileData);

    const { error: profileError } = await supabase.from('profiles').insert(profileData);

    console.log('🔍 Profile creation result:', { error: profileError });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      throw new Error('Failed to create user profile. Please try again.');
    }

    console.log('✅ Signup completed successfully');
    return { data: authData, error: null };
  },

  async signIn(email: string, password: string) {
    console.log('🔍 authService.signIn called with email:', email);
    
    // First, let's check if the user exists in our profiles table
    console.log('🔍 Checking if user exists in profiles table...');
    // Note: We can't query by email since profiles table doesn't have email column
    // We'll check after we get the user ID from auth
    console.log('🔍 Skipping profile check by email (profiles table has no email column)');
    
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔍 Sign in result:', { 
      user: !!data.user, 
      session: !!data.session, 
      error,
      userId: data.user?.id,
      emailConfirmed: data.user?.email_confirmed_at
    });

    if (error) {
      console.error('❌ Sign in failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      throw error;
    }
    
    // After successful sign in, let's verify the profile exists
    if (data.user) {
      console.log('🔍 Verifying profile after sign in...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      console.log('🔍 Profile verification result:', { profile, error: profileError });
      
      if (profileError) {
        console.warn('⚠️ Profile not found after sign in, this might cause issues');
      }
    }
    
    console.log('✅ Sign in successful');
    return { data, error: null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async likeIncident(incidentId: string, userId: string) {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('incident_id', incidentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('incident_id', incidentId)
        .eq('user_id', userId);

      if (error) throw error;

      // Decrement likes count
      await supabase.rpc('decrement_likes_count', { incident_id: incidentId });

      return { action: 'unliked' };
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({
          incident_id: incidentId,
          user_id: userId,
        });

      if (error) throw error;

      // Increment likes count
      await supabase.rpc('increment_likes_count', { incident_id: incidentId });

      return { action: 'liked' };
    }
  },

  async updateProfile(userId: string, updates: {
    full_name?: string;
    username?: string;
    phone_number?: string;
    avatar_url?: string;
  }) {
    // If username is being updated, check if it's already taken
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', updates.username)
        .neq('id', userId)
        .single();

      if (existingUser) {
        throw new Error('Username already taken. Please choose another one.');
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { data, error: null };
  },
};