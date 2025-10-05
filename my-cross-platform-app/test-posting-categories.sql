-- Test Posting Different Categories
-- This will test if all categories work properly in the database

-- 1. Check current incidents count
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
    test_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test each category with each severity
        FOREACH cat IN ARRAY category_list LOOP
            FOREACH sev IN ARRAY severity_list LOOP
                test_count := test_count + 1;
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
                        UPPER(cat) || ' INCIDENT - ' || UPPER(sev) || ' SEVERITY',
                        'Testing ' || cat || ' incident with ' || sev || ' severity - comprehensive test',
                        cat::incident_category,
                        sev::incident_severity,
                        cat || ' Test Location ' || test_count,
                        'POINT(123.8854 10.3157)',
                        false,
                        false,
                        false,
                        0, 0, 0, 0,
                        'open'
                    ) RETURNING id INTO incident_id;
                    
                    RAISE NOTICE 'SUCCESS: % with % severity (ID: %)', cat, sev, incident_id;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'FAILED: % with % severity - %', cat, sev, SQLERRM;
                END;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Total test combinations attempted: % (7 categories × 4 severities = 28 tests)', test_count;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Check how many incidents were created
SELECT 'AFTER TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 4. Show incidents by category
SELECT 'INCIDENTS BY CATEGORY' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
WHERE title LIKE '%INCIDENT%'
GROUP BY category 
ORDER BY category;

-- 5. Show incidents by severity
SELECT 'INCIDENTS BY SEVERITY' as test;
SELECT severity, COUNT(*) as count 
FROM incidents 
WHERE title LIKE '%INCIDENT%'
GROUP BY severity 
ORDER BY severity;

-- 6. Show sample incidents
SELECT 'SAMPLE INCIDENTS' as test;
SELECT id, title, category, severity, created_at 
FROM incidents 
WHERE title LIKE '%INCIDENT%'
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Test if function can see all incidents
SELECT 'FUNCTION CAN SEE ALL INCIDENTS' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 8. Show sample from function
SELECT 'SAMPLE FROM FUNCTION' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 10;
