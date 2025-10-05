-- Test All Categories and Severities
-- This will test if all categories and severities work in the database

-- 1. First, let's see what we have
SELECT 'BEFORE TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Test all categories with different severities
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    category_list TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
    severity_list TEXT[] := ARRAY['low', 'medium', 'high', 'critical'];
    cat TEXT;
    sev TEXT;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test each category with each severity
        FOREACH cat IN ARRAY category_list LOOP
            FOREACH sev IN ARRAY severity_list LOOP
                BEGIN
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
                        'TEST ' || UPPER(cat) || ' - ' || UPPER(sev),
                        'Testing ' || cat || ' category with ' || sev || ' severity',
                        cat::incident_category,
                        sev::incident_severity,
                        'Test Address',
                        'POINT(123.8854 10.3157)',
                        false,
                        false,
                        false,
                        0, 0, 0, 0,
                        'open'
                    ) RETURNING id INTO incident_id;
                    
                    RAISE NOTICE 'Success: % with % severity (ID: %)', cat, sev, incident_id;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Failed: % with % severity - %', cat, sev, SQLERRM;
                END;
            END LOOP;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Check how many incidents were created
SELECT 'AFTER TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 4. Show all test incidents
SELECT 'ALL TEST INCIDENTS' as test;
SELECT id, title, category, severity, created_at 
FROM incidents 
WHERE title LIKE 'TEST %'
ORDER BY created_at DESC;

-- 5. Check if function can see all incidents
SELECT 'FUNCTION CAN SEE ALL INCIDENTS' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 6. Show sample from function
SELECT 'SAMPLE FROM FUNCTION' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 10;

