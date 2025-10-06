-- Test Rescue as Local Data
-- This verifies that rescue is handled locally, not in database

-- 1. Check that incidents table doesn't have is_rescue column
SELECT 
    'INCIDENTS COLUMNS CHECK' as test,
    column_name
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
AND column_name = 'is_rescue';

-- 2. Create a test incident (without rescue field)
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert a test incident without rescue field
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
            'TEST INCIDENT - Rescue Local Test',
            'This incident should appear in the news feed. Rescue status will be handled locally in the mobile app.',
            'other',
            'medium',
            'Test Address, Cebu City',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0,
            0,
            0,
            0
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Test incident created successfully with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found - please create a user first';
    END IF;
END $$;

-- 3. Verify the function works without rescue column
SELECT 
    'FUNCTION TEST' as test,
    COUNT(*) as incident_count
FROM get_incidents_with_user_info();

-- 4. Show sample data (rescue will be false by default in function)
SELECT 
    'SAMPLE DATA' as test,
    id,
    title,
    is_rescue,  -- This will be false (hardcoded in function)
    is_verified,
    views,
    likes,
    user_name,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 3;

-- 5. Final verification
SELECT 
    'FINAL VERIFICATION' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: All incidents visible, rescue handled locally'
        ELSE 'ISSUE: Some incidents not visible'
    END as result;



