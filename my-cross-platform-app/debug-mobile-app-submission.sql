-- Debug Mobile App Submission Issue
-- Check what's happening when mobile app tries to submit

-- 1. Check current incidents count
SELECT 'CURRENT INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Show recent incidents
SELECT 'RECENT INCIDENTS' as test;
SELECT id, title, category, severity, reporter_id, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check what categories and severities are valid
SELECT 'VALID CATEGORIES' as test;
SELECT unnest(enum_range(NULL::incident_category)) as category;

SELECT 'VALID SEVERITIES' as test;
SELECT unnest(enum_range(NULL::incident_severity)) as severity;

-- 4. Check if there are any recent failed inserts (this might show in logs)
-- Note: This won't show failed inserts, but we can check for any issues

-- 5. Test insert with the exact values the mobile app uses
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert with exact mobile app values
        INSERT INTO incidents (
            reporter_id,
            title,
            description,
            category,
            severity,
            address,
            landmark,
            is_anonymous,
            is_urgent,
            is_verified,
            views_count,
            likes_count,
            comments_count,
            shares_count,
            location,
            status
        ) VALUES (
            test_user_id,
            'MOBILE APP TEST - Exact Values',
            'Testing with exact values from mobile app',
            'other',  -- Default category from mobile app
            'medium', -- Default severity from mobile app
            'Test Address',
            'Test Landmark',
            false,    -- is_anonymous
            false,    -- is_urgent
            false,    -- is_verified
            0,        -- views_count
            0,        -- likes_count
            0,        -- comments_count
            0,        -- shares_count
            'POINT(123.8854 10.3157)', -- location
            'open'    -- status
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Mobile app test insert successful with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mobile app test insert failed: %', SQLERRM;
END $$;

-- 6. Check if the test insert worked
SELECT 'AFTER TEST INSERT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 7. Check if function can see the new incident
SELECT 'FUNCTION CAN SEE NEW INCIDENT' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 8. Show the new incident
SELECT 'NEW INCIDENT DETAILS' as test;
SELECT id, title, category, severity, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 1;










