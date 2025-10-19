-- Step-by-Step Debugging
-- Let's find out exactly what's wrong

-- STEP 1: Check if the function exists
SELECT 
    'STEP 1: FUNCTION EXISTS?' as step,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_incidents_with_user_info'
AND routine_schema = 'public';

-- STEP 2: Check what columns actually exist in incidents table
SELECT 
    'STEP 2: INCIDENTS COLUMNS' as step,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 3: Check what columns exist in profiles table
SELECT 
    'STEP 3: PROFILES COLUMNS' as step,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 4: Check if there are any incidents at all
SELECT 
    'STEP 4: INCIDENTS COUNT' as step,
    COUNT(*) as total_incidents
FROM incidents;

-- STEP 5: Check if there are any profiles
SELECT 
    'STEP 5: PROFILES COUNT' as step,
    COUNT(*) as total_profiles
FROM profiles;

-- STEP 6: Try to call the function (this will show the exact error)
SELECT 
    'STEP 6: FUNCTION CALL TEST' as step,
    COUNT(*) as result
FROM get_incidents_with_user_info();

-- STEP 7: Check RLS policies on incidents table
SELECT 
    'STEP 7: RLS POLICIES' as step,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'incidents';

-- STEP 8: Check if we can select from incidents directly
SELECT 
    'STEP 8: DIRECT SELECT TEST' as step,
    COUNT(*) as direct_count
FROM incidents;

-- STEP 9: Show sample incident data
SELECT 
    'STEP 9: SAMPLE INCIDENT' as step,
    id,
    title,
    created_at
FROM incidents
LIMIT 3;












