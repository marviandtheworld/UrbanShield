-- Test Like System and Posting Categories
-- This will test both the like functionality and category posting

-- 1. Check current state
SELECT 'BEFORE TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Test creating incidents with different categories
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
    cat TEXT;
    test_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test each category
        FOREACH cat IN ARRAY categories LOOP
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
                    'TEST ' || UPPER(cat) || ' INCIDENT',
                    'Testing ' || cat || ' category posting functionality',
                    cat::incident_category,
                    'medium'::incident_severity,
                    cat || ' Test Location',
                    'POINT(123.8854 10.3157)',
                    false,
                    false,
                    false,
                    0, 0, 0, 0,
                    'open'
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'SUCCESS: % category incident created (ID: %)', cat, incident_id;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'FAILED: % category - %', cat, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'Total categories tested: %', test_count;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Check incidents created
SELECT 'AFTER TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 4. Show incidents by category
SELECT 'INCIDENTS BY CATEGORY' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
WHERE title LIKE 'TEST%'
GROUP BY category 
ORDER BY category;

-- 5. Test like functionality
DO $$
DECLARE
    test_incident_id UUID;
    current_likes INTEGER;
    new_likes INTEGER;
BEGIN
    -- Get the first incident
    SELECT id, likes_count INTO test_incident_id, current_likes FROM incidents LIMIT 1;
    
    IF test_incident_id IS NOT NULL THEN
        -- Test incrementing likes
        new_likes := current_likes + 1;
        
        UPDATE incidents 
        SET likes_count = new_likes 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'SUCCESS: Likes updated from % to % for incident %', current_likes, new_likes, test_incident_id;
        
        -- Test decrementing likes
        UPDATE incidents 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'SUCCESS: Likes decremented for incident %', test_incident_id;
    ELSE
        RAISE NOTICE 'No incidents found for like testing';
    END IF;
END $$;

-- 6. Check if function can see all incidents
SELECT 'FUNCTION CAN SEE ALL INCIDENTS' as test;
SELECT COUNT(*) as count FROM get_incidents_with_user_info();

-- 7. Show sample incidents with likes
SELECT 'SAMPLE INCIDENTS WITH LIKES' as test;
SELECT id, title, category, severity, likes, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Test specific categories that might be failing
SELECT 'TESTING SPECIFIC CATEGORIES' as test;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM incidents WHERE category = 'crime') THEN '✅ Crime category works'
        ELSE '❌ Crime category failed'
    END as crime_test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM incidents WHERE category = 'fire') THEN '✅ Fire category works'
        ELSE '❌ Fire category failed'
    END as fire_test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM incidents WHERE category = 'earthquake') THEN '✅ Earthquake category works'
        ELSE '❌ Earthquake category failed'
    END as earthquake_test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM incidents WHERE category = 'other') THEN '✅ Other category works'
        ELSE '❌ Other category failed'
    END as other_test;













