-- Test Categories Fix
-- Verify that all categories work with the mobile app

-- 1. Check current incidents count
SELECT 'BEFORE TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Test specific categories (crime and earthquake) with different severities
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    category_list TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
    test_categories TEXT[] := ARRAY['crime', 'earthquake'];  -- Only test these two
    severity_list TEXT[] := ARRAY['low', 'medium', 'high', 'critical'];
    cat TEXT;
    sev TEXT;
    test_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test only crime and earthquake categories with different severities
        FOREACH cat IN ARRAY test_categories LOOP
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
                        CASE 
                            WHEN cat = 'crime' THEN 'CRIME INCIDENT - ' || UPPER(sev) || ' SEVERITY'
                            WHEN cat = 'earthquake' THEN 'EARTHQUAKE INCIDENT - ' || UPPER(sev) || ' SEVERITY'
                            ELSE 'TEST ' || UPPER(cat) || ' - ' || UPPER(sev) || ' SEVERITY'
                        END,
                        CASE 
                            WHEN cat = 'crime' THEN 'Testing crime incident with ' || sev || ' severity - theft, disturbance, or criminal activity'
                            WHEN cat = 'earthquake' THEN 'Testing earthquake incident with ' || sev || ' severity - seismic activity, ground shaking'
                            ELSE 'Testing ' || cat || ' category with ' || sev || ' severity from mobile app'
                        END,
                        cat::incident_category,
                        sev::incident_severity,
                        CASE 
                            WHEN cat = 'crime' THEN 'Crime Scene Location ' || test_count
                            WHEN cat = 'earthquake' THEN 'Earthquake Epicenter ' || test_count
                            ELSE 'Test Address ' || test_count
                        END,
                        'POINT(123.8854 10.3157)',
                        false,
                        false,
                        false,
                        0, 0, 0, 0,
                        'open'
                    ) RETURNING id INTO incident_id;
                    
                    RAISE NOTICE 'SUCCESS: % category with % severity (ID: %)', cat, sev, incident_id;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'FAILED: % category with % severity - %', cat, sev, SQLERRM;
                END;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Total test combinations attempted: % (2 categories × 4 severities = 8 tests)', test_count;
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
