-- Ultra Simple Debug - Let's find the exact problem
-- Run this step by step and tell me what errors you see

-- STEP 1: Check if incidents table exists and has data
SELECT 'STEP 1: INCIDENTS TABLE' as test;
SELECT COUNT(*) as incident_count FROM incidents;

-- STEP 2: Check if profiles table exists and has data  
SELECT 'STEP 2: PROFILES TABLE' as test;
SELECT COUNT(*) as profile_count FROM profiles;

-- STEP 3: Check what columns exist in incidents table
SELECT 'STEP 3: INCIDENTS COLUMNS' as test;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 4: Try to select from incidents directly
SELECT 'STEP 4: DIRECT SELECT FROM INCIDENTS' as test;
SELECT id, title, created_at FROM incidents LIMIT 3;

-- STEP 5: Check if function exists
SELECT 'STEP 5: FUNCTION EXISTS' as test;
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'get_incidents_with_user_info';

-- STEP 6: Try to call the function (this will show the exact error)
SELECT 'STEP 6: FUNCTION CALL' as test;
SELECT COUNT(*) FROM get_incidents_with_user_info();



