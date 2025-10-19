-- Check Available Incident Types and Severities
-- This will show us what categories and severities are available in the database

-- 1. Check what incident categories are available
SELECT 'AVAILABLE CATEGORIES' as test;
SELECT unnest(enum_range(NULL::incident_category)) as category;

-- 2. Check what incident severities are available  
SELECT 'AVAILABLE SEVERITIES' as test;
SELECT unnest(enum_range(NULL::incident_severity)) as severity;

-- 3. Check what incident statuses are available
SELECT 'AVAILABLE STATUSES' as test;
SELECT unnest(enum_range(NULL::incident_status)) as status;

-- 4. Show current incidents with their categories and severities
SELECT 'CURRENT INCIDENTS' as test;
SELECT id, title, category, severity, status, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Test insert with different categories and severities
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test with different categories
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
        ) VALUES 
        (
            test_user_id,
            'TEST CRIME INCIDENT',
            'Testing crime category',
            'crime',
            'high',
            'Test Address',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0, 0, 0, 0,
            'open'
        ),
        (
            test_user_id,
            'TEST FIRE INCIDENT',
            'Testing fire category',
            'fire',
            'critical',
            'Test Address',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0, 0, 0, 0,
            'open'
        ),
        (
            test_user_id,
            'TEST ACCIDENT INCIDENT',
            'Testing accident category',
            'accident',
            'low',
            'Test Address',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0, 0, 0, 0,
            'open'
        );
        
        RAISE NOTICE 'Multiple category test inserts successful';
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Multiple category test failed: %', SQLERRM;
END $$;

-- 6. Check if the test inserts worked
SELECT 'AFTER TEST INSERTS' as test;
SELECT id, title, category, severity, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;














