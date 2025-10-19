-- Debug Intermittent Issue
-- Worked once but now doesn't work

-- 1. Check current incidents count
SELECT 'CURRENT INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Show all incidents with timestamps
SELECT 'ALL INCIDENTS' as test;
SELECT id, title, reporter_id, created_at, updated_at
FROM incidents 
ORDER BY created_at DESC;

-- 3. Check RLS policies
SELECT 'CURRENT RLS POLICIES' as test;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'incidents';

-- 4. Test function
SELECT 'FUNCTION TEST' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 5. Check if function exists and is working
SELECT 'FUNCTION STATUS' as test;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_incidents_with_user_info';

-- 6. Test direct insert (this will show if RLS is blocking)
SELECT 'TEST DIRECT INSERT' as test;
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
            'INTERMITTENT TEST - ' || NOW()::TEXT,
            'Testing if insert works at ' || NOW()::TEXT,
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
        
        RAISE NOTICE 'Insert successful with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert failed: %', SQLERRM;
END $$;

-- 7. Check count after test
SELECT 'COUNT AFTER TEST' as test;
SELECT COUNT(*) as count FROM incidents;

-- 8. Check if function can see the new incident
SELECT 'FUNCTION CAN SEE NEW INCIDENT' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();












