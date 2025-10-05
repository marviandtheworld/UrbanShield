-- Debug News Feed Issue
-- Incidents exist in database but not showing in news feed

-- 1. Check if incidents exist in database
SELECT 'STEP 1: INCIDENTS IN DATABASE' as test;
SELECT COUNT(*) as total_incidents FROM incidents;

-- 2. Show sample incidents from database
SELECT 'STEP 2: SAMPLE INCIDENTS FROM DATABASE' as test;
SELECT id, title, created_at, reporter_id FROM incidents ORDER BY created_at DESC LIMIT 3;

-- 3. Check if function exists
SELECT 'STEP 3: FUNCTION EXISTS' as test;
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'get_incidents_with_user_info';

-- 4. Try to call the function (this will show the exact error)
SELECT 'STEP 4: FUNCTION CALL TEST' as test;
SELECT COUNT(*) as function_result FROM get_incidents_with_user_info();

-- 5. If function works, show sample data from function
SELECT 'STEP 5: SAMPLE DATA FROM FUNCTION' as test;
SELECT id, title, user_name, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 3;

-- 6. Check RLS policies on incidents table
SELECT 'STEP 6: RLS POLICIES' as test;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'incidents';

-- 7. Check if we can select from incidents directly (bypassing RLS)
SELECT 'STEP 7: DIRECT SELECT TEST' as test;
SELECT COUNT(*) as direct_count FROM incidents;

-- 8. Check profiles table
SELECT 'STEP 8: PROFILES CHECK' as test;
SELECT COUNT(*) as profile_count FROM profiles;

-- 9. Show sample profile data
SELECT 'STEP 9: SAMPLE PROFILES' as test;
SELECT id, full_name, username, user_type FROM profiles LIMIT 3;

