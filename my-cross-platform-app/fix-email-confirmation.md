# Fix Email Confirmation Issue

## 🚨 Immediate Fix Required

The sign-in is failing because Supabase requires email confirmation. Here are two ways to fix this:

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Find **"Enable email confirmations"**
4. **Turn it OFF**
5. Click **Save**

### Option 2: Confirm Email Manually

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find your user: `ninamarie.antonio@gmail.com`
4. Click on the user
5. Look for **"Email Confirmed"** field
6. If it shows **"No"**, click **"Confirm Email"**

## 🔧 Database Schema Fix

Run this SQL in your Supabase SQL editor to add the missing email column:

```sql
-- Add email column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with email from auth.users
UPDATE profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE profiles.id = auth_users.id;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

## 🧪 Test After Fix

1. **Disable email confirmation** in Supabase settings
2. **Run the database schema update** (add email column)
3. **Try signing in again** using the Test tab
4. **Check console logs** for success

## 📱 Alternative: Create New Account

If the above doesn't work, try creating a completely new account:

1. Use a different email address
2. Go through the signup process
3. Try to sign in immediately after signup

The new account should work since we've fixed the schema issues.
