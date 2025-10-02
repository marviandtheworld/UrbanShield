# Sign-In Debugging Guide

## 🔍 How to Debug Sign-In Issues

### Step 1: Use the Test Tab
1. Open the app
2. Navigate to the "Test" tab in the bottom navigation
3. Enter your email and password
4. Click "Test Sign In" to see detailed logs

### Step 2: Check Console Logs
Look for these specific log messages in your console:

#### ✅ Success Indicators:
- `🔍 Login attempt started`
- `✅ Login successful`
- `✅ Sign in successful`
- `🔍 Profile loaded successfully`

#### ❌ Error Indicators:
- `❌ Login failed`
- `❌ Sign in failed`
- `⚠️ Profile not found after sign in`

### Step 3: Common Issues & Solutions

#### Issue 1: "Invalid login credentials"
**Cause**: Wrong email/password or user doesn't exist
**Solution**: 
- Verify email and password are correct
- Check if user was created during signup
- Try creating a new account

#### Issue 2: "Email not confirmed"
**Cause**: Supabase requires email verification
**Solution**: 
- Check your email for verification link
- Or disable email confirmation in Supabase settings

#### Issue 3: "Profile not found"
**Cause**: User exists in auth but not in profiles table
**Solution**: 
- Check if profile was created during signup
- Manually create profile in database

#### Issue 4: "Session not persisting"
**Cause**: Session storage issues
**Solution**: 
- Check if cookies/localStorage is enabled
- Clear app data and try again

### Step 4: Database Checks

Run these queries in your Supabase SQL editor:

```sql
-- Check if user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Check if profile exists
SELECT * FROM profiles 
WHERE email = 'your-email@example.com';

-- Check if profile exists by user ID
SELECT * FROM profiles 
WHERE id = 'user-id-from-above-query';
```

### Step 5: Supabase Settings Check

1. Go to Supabase Dashboard → Authentication → Settings
2. Check these settings:
   - **Enable email confirmations**: Should be OFF for testing
   - **Enable phone confirmations**: Should be OFF
   - **Enable anonymous sign-ins**: Can be ON
   - **Enable email change confirmations**: Should be OFF for testing

### Step 6: RLS Policy Check

Make sure these RLS policies exist and are correct:

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- If no policies exist, create them:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🚨 Quick Fixes

### Fix 1: Disable Email Confirmation
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Turn OFF "Enable email confirmations"
4. Save settings

### Fix 2: Reset User Password
1. Go to Supabase Dashboard
2. Authentication → Users
3. Find your user
4. Click "Reset password"
5. Check email for reset link

### Fix 3: Manual Profile Creation
If profile doesn't exist, create it manually:

```sql
INSERT INTO profiles (id, full_name, username, user_type, email)
VALUES (
    'user-id-from-auth',
    'Your Name',
    'your-username',
    'community_member',
    'your-email@example.com'
);
```

## 📱 Testing Steps

1. **Clear app data** (uninstall/reinstall or clear storage)
2. **Create new account** using the signup form
3. **Check console logs** during signup
4. **Try to sign in** immediately after signup
5. **Use Test tab** to debug any issues

## 🔧 Debug Commands

Add these to your browser console for additional debugging:

```javascript
// Check current session
supabase.auth.getSession().then(console.log);

// Check current user
supabase.auth.getUser().then(console.log);

// Sign out
supabase.auth.signOut();

// Check profiles table
supabase.from('profiles').select('*').then(console.log);
```
