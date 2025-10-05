-- Final Verification Test
-- This will test the complete flow from incident creation to display

-- 1. Check current incidents count
SELECT 'BEFORE TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Check if function exists and works
SELECT 'FUNCTION TEST' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 3. Create a test incident with crime category
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
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
            shares_count,
            status
        ) VALUES (
            test_user_id,
            'FINAL TEST - Crime Incident',
            'Testing crime category for final verification',
            'crime'::incident_category,
            'medium'::incident_severity,
            'Test Location',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0, 0, 0, 0,
            'open'
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'SUCCESS: Crime incident created with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 4. Check incidents count after creation
SELECT 'AFTER TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 5. Check if function can see the new incident
SELECT 'FUNCTION CAN SEE NEW INCIDENT' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 6. Show the new incident details
SELECT 'NEW INCIDENT DETAILS' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
WHERE title LIKE 'FINAL TEST%'
ORDER BY created_at DESC;

-- 7. Show all incidents to verify they're visible
SELECT 'ALL INCIDENTS' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 5;
