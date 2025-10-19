-- Test: Create Incident and View It
-- This will help us see if the basic flow works

-- 1. First, let's see what we have
SELECT 
    'BEFORE: INCIDENTS COUNT' as step,
    COUNT(*) as count
FROM incidents;

-- 2. Create a test incident
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
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
            is_anonymous,
            is_urgent,
            is_verified,
            views_count,
            likes_count,
            comments_count,
            shares_count
        ) VALUES (
            test_user_id,
            'TEST INCIDENT - Debug Test',
            'This is a test incident to see if it appears in the news feed.',
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
        
        RAISE NOTICE 'Test incident created with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found - please create a user first';
    END IF;
END $$;

-- 3. Check incidents count after creation
SELECT 
    'AFTER: INCIDENTS COUNT' as step,
    COUNT(*) as count
FROM incidents;

-- 4. Try to get incidents using the function
SELECT 
    'FUNCTION RESULT' as step,
    COUNT(*) as count
FROM get_incidents_with_user_info();

-- 5. Show the actual incidents
SELECT 
    'ACTUAL INCIDENTS' as step,
    id,
    title,
    created_at
FROM incidents
ORDER BY created_at DESC;

-- 6. Show function results
SELECT 
    'FUNCTION RESULTS' as step,
    id,
    title,
    user_name,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC;












