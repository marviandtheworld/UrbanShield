-- Debug Incidents Issue - Comprehensive Check
-- Run this in your Supabase SQL editor to diagnose the problem

-- 1. Check if all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('incidents', 'profiles')
ORDER BY table_name;

-- 2. Check if all required enum types exist
SELECT 
    typname as enum_name,
    enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('user_type', 'verification_status', 'posting_privilege', 'incident_category', 'incident_severity', 'incident_status')
ORDER BY typname, enumlabel;

-- 3. Check incidents table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if there are any incidents in the database
SELECT 
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_incidents,
    COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_incidents
FROM incidents;

-- 6. Check if there are any profiles in the database
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_type = 'guest' THEN 1 END) as guest_profiles,
    COUNT(CASE WHEN user_type = 'resident' THEN 1 END) as resident_profiles,
    COUNT(CASE WHEN user_type = 'government' THEN 1 END) as government_profiles
FROM profiles;

-- 7. Check RLS policies on incidents table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'incidents';

-- 8. Check if the get_incidents_with_user_info function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_incidents_with_user_info' 
AND routine_schema = 'public';

-- 9. Test the function directly (this will show if it works)
SELECT * FROM get_incidents_with_user_info() LIMIT 5;

-- 10. Check recent incidents with details
SELECT 
    i.id,
    i.title,
    i.is_approved,
    i.is_moderated,
    i.created_at,
    p.user_type,
    p.verification_status
FROM incidents i
LEFT JOIN profiles p ON i.reporter_id = p.id
ORDER BY i.created_at DESC
LIMIT 10;

