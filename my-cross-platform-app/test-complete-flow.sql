-- Test Complete Flow - Verify Incidents Work End-to-End
-- Run this after applying all fixes

-- 1. Check if all required tables and functions exist
SELECT 
    'Tables Check' as test_type,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'incidents' AND table_schema = 'public') as incidents_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') as profiles_table;

-- 2. Check if all required functions exist
SELECT 
    'Functions Check' as test_type,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'get_incidents_with_user_info' AND routine_schema = 'public') as get_incidents_function,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'mark_incident_verified' AND routine_schema = 'public') as verify_function;

-- 3. Check current incidents count
SELECT 
    'Data Check' as test_type,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM incidents WHERE is_verified = true) as verified_incidents,
    (SELECT COUNT(*) FROM incidents WHERE is_verified = false) as unverified_incidents;

-- 4. Test the get_incidents_with_user_info function
SELECT 
    'Function Test' as test_type,
    COUNT(*) as visible_incidents
FROM get_incidents_with_user_info();

-- 5. Create a test incident to verify the flow works
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert a test incident
        INSERT INTO incidents (
            reporter_id,
            title,
            description,
            category,
            severity,
            address,
            location,
            is_approved,
            is_verified,
            votes,
            shares_count,
            priority
        ) VALUES (
            test_user_id,
            'Test Incident - ' || NOW()::text,
            'This is a test incident to verify the complete flow works. It should be visible immediately and can be verified by admin later.',
            'other',
            'medium',
            'Test Address, Cebu City',
            'POINT(123.8854 10.3157)',
            true,
            false,
            0,
            0,
            0
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Test incident created successfully with ID: %', incident_id;
        
        -- Test marking it as verified
        PERFORM mark_incident_verified(incident_id);
        RAISE NOTICE 'Test incident verified successfully';
        
    ELSE
        RAISE NOTICE 'No users found in the database';
    END IF;
END $$;

-- 6. Final verification - show all incidents
SELECT 
    'Final Results' as test_type,
    i.id,
    i.title,
    i.is_approved,
    i.is_verified,
    i.created_at,
    p.user_type,
    p.username
FROM incidents i
LEFT JOIN profiles p ON i.reporter_id = p.id
ORDER BY i.created_at DESC
LIMIT 10;

-- 7. Test the function one more time to ensure it returns all incidents
SELECT 
    'Function Test Results' as test_type,
    id,
    title,
    is_verified,
    user_name,
    user_type
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 5;

