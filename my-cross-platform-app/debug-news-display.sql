-- Debug News Display Issue
-- Run this to check why incidents aren't showing in news

-- 1. Check if incidents table exists and has data
SELECT 
    'Incidents Table Check' as test,
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_incidents,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_incidents
FROM incidents;

-- 2. Check if profiles table exists and has data
SELECT 
    'Profiles Table Check' as test,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_type = 'government' THEN 1 END) as government_users,
    COUNT(CASE WHEN user_type = 'resident' THEN 1 END) as resident_users
FROM profiles;

-- 3. Check if get_incidents_with_user_info function exists and works
SELECT 
    'Function Test' as test,
    COUNT(*) as function_returns
FROM get_incidents_with_user_info();

-- 4. Check RLS policies on incidents table
SELECT 
    'RLS Policies' as test,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'incidents';

-- 5. Check if there are any incidents with proper data
SELECT 
    'Sample Incidents' as test,
    id,
    title,
    is_approved,
    is_verified,
    created_at,
    reporter_id
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check if profiles are linked to incidents
SELECT 
    'Incident-Profile Link' as test,
    i.id as incident_id,
    i.title,
    i.is_approved,
    p.id as profile_id,
    p.user_type,
    p.full_name
FROM incidents i
LEFT JOIN profiles p ON i.reporter_id = p.id
ORDER BY i.created_at DESC 
LIMIT 5;

-- 7. Test the function directly with sample data
SELECT 
    'Function Sample Data' as test,
    id,
    title,
    is_approved,
    is_verified,
    user_name,
    user_type
FROM get_incidents_with_user_info()
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Check if there are any errors in the function
DO $$
BEGIN
    -- Try to call the function and catch any errors
    PERFORM * FROM get_incidents_with_user_info() LIMIT 1;
    RAISE NOTICE 'Function works correctly';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Function error: %', SQLERRM;
END $$;




