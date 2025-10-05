-- Test Only Crime and Earthquake Categories
-- This will test ONLY crime and earthquake, no other categories

-- 1. Check current incidents count
SELECT 'BEFORE TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Test ONLY crime and earthquake categories
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    sev TEXT;
    test_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test CRIME category with all severities
        FOREACH sev IN ARRAY ARRAY['low', 'medium', 'high', 'critical'] LOOP
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
                    'CRIME INCIDENT - ' || UPPER(sev) || ' SEVERITY',
                    'Testing crime incident with ' || sev || ' severity - theft, disturbance, or criminal activity',
                    'crime'::incident_category,
                    sev::incident_severity,
                    'Crime Scene Location ' || test_count,
                    'POINT(123.8854 10.3157)',
                    false,
                    false,
                    false,
                    0, 0, 0, 0,
                    'open'
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'SUCCESS: CRIME with % severity (ID: %)', sev, incident_id;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'FAILED: CRIME with % severity - %', sev, SQLERRM;
            END;
        END LOOP;
        
        -- Test EARTHQUAKE category with all severities
        FOREACH sev IN ARRAY ARRAY['low', 'medium', 'high', 'critical'] LOOP
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
                    'EARTHQUAKE INCIDENT - ' || UPPER(sev) || ' SEVERITY',
                    'Testing earthquake incident with ' || sev || ' severity - seismic activity, ground shaking',
                    'earthquake'::incident_category,
                    sev::incident_severity,
                    'Earthquake Epicenter ' || test_count,
                    'POINT(123.8854 10.3157)',
                    false,
                    false,
                    false,
                    0, 0, 0, 0,
                    'open'
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'SUCCESS: EARTHQUAKE with % severity (ID: %)', sev, incident_id;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'FAILED: EARTHQUAKE with % severity - %', sev, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'Total test combinations attempted: % (2 categories × 4 severities = 8 tests)', test_count;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Check how many incidents were created
SELECT 'AFTER TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 4. Show only crime and earthquake incidents
SELECT 'CRIME AND EARTHQUAKE INCIDENTS ONLY' as test;
SELECT id, title, category, severity, created_at 
FROM incidents 
WHERE title LIKE 'CRIME INCIDENT%' OR title LIKE 'EARTHQUAKE INCIDENT%'
ORDER BY created_at DESC;

-- 5. Check if function can see the new incidents
SELECT 'FUNCTION CAN SEE NEW INCIDENTS' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 6. Show sample from function
SELECT 'SAMPLE FROM FUNCTION' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 10;

