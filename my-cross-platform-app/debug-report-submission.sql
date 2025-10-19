-- Debug Report Submission Issue
-- Test incident works but user reports don't appear

-- 1. Check current incidents count
SELECT 'CURRENT INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Show recent incidents
SELECT 'RECENT INCIDENTS' as test;
SELECT id, title, reporter_id, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check RLS policies on incidents table
SELECT 'RLS POLICIES ON INCIDENTS' as test;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'incidents';

-- 4. Check if we can insert directly (this will show if RLS is blocking)
SELECT 'TEST DIRECT INSERT' as test;
-- This will only work if RLS allows it
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a test incident
        INSERT INTO incidents (
            reporter_id,
            title,
            description,
            category,
            severity,
            address,
            location,
            is_anonymous,
            is_urgent,
            is_verified,
            views_count,
            likes_count,
            comments_count,
            shares_count
        ) VALUES (
            test_user_id,
            'DIRECT INSERT TEST',
            'Testing if direct insert works',
            'other',
            'medium',
            'Test Address',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0,
            0,
            0,
            0
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Direct insert successful with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Direct insert failed: %', SQLERRM;
END $$;

-- 5. Check incidents count after test insert
SELECT 'INCIDENTS COUNT AFTER TEST' as test;
SELECT COUNT(*) as count FROM incidents;

-- 6. Check if the function can see the new incident
SELECT 'FUNCTION CAN SEE NEW INCIDENT' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();














