-- Test Complete Comment System
-- This will test the entire comment system including count updates

-- 1. Check current state
SELECT 'BEFORE TEST: INCIDENTS AND COMMENTS' as test;
SELECT 
    'Total incidents' as metric,
    COUNT(*)::text as value 
FROM incidents
UNION ALL
SELECT 
    'Total comments' as metric,
    COUNT(*)::text as value 
FROM comments
UNION ALL
SELECT 
    'Incidents with comments' as metric,
    COUNT(*)::text as value 
FROM incidents 
WHERE comments_count > 0;

-- 2. Create test incidents with different comment counts
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    comment_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'earthquake'];
    cat TEXT;
    i INTEGER;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        FOREACH cat IN ARRAY categories LOOP
            -- Create incident
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
                'COMMENT TEST - ' || UPPER(cat) || ' INCIDENT',
                'Testing comment system for ' || cat || ' category',
                cat::incident_category,
                'medium'::incident_severity,
                cat || ' Test Location',
                'POINT(123.8854 10.3157)',
                false,
                false,
                false,
                0, 0, 0, 0,
                'open'::incident_status
            ) RETURNING id INTO incident_id;
            
            RAISE NOTICE 'Created test incident for % (ID: %)', cat, incident_id;
            
            -- Add different number of comments to each incident
            CASE cat
                WHEN 'crime' THEN
                    -- Add 2 comments to crime incident
                    FOR i IN 1..2 LOOP
                        INSERT INTO comments (incident_id, user_id, content, is_anonymous)
                        VALUES (incident_id, test_user_id, 'Crime comment ' || i, false);
                    END LOOP;
                WHEN 'fire' THEN
                    -- Add 1 comment to fire incident
                    INSERT INTO comments (incident_id, user_id, content, is_anonymous)
                    VALUES (incident_id, test_user_id, 'Fire comment', false);
                WHEN 'earthquake' THEN
                    -- Add 3 comments to earthquake incident
                    FOR i IN 1..3 LOOP
                        INSERT INTO comments (incident_id, user_id, content, is_anonymous)
                        VALUES (incident_id, test_user_id, 'Earthquake comment ' || i, false);
                    END LOOP;
            END CASE;
            
            RAISE NOTICE 'Added comments for % incident', cat;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Check results after test
SELECT 'AFTER TEST: INCIDENTS WITH COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM incidents 
WHERE title LIKE 'COMMENT TEST%'
ORDER BY category;

-- 4. Verify comment count accuracy
SELECT 'COMMENT COUNT ACCURACY' as test;
SELECT 
    i.id,
    i.title,
    i.category,
    i.comments_count as stored_count,
    COUNT(c.id) as actual_comments,
    CASE 
        WHEN i.comments_count = COUNT(c.id) THEN '✅ Accurate'
        ELSE '❌ Mismatch'
    END as status
FROM incidents i
LEFT JOIN comments c ON i.id = c.incident_id
WHERE i.title LIKE 'COMMENT TEST%'
GROUP BY i.id, i.title, i.category, i.comments_count
ORDER BY i.category;

-- 5. Test function returns correct data
SELECT 'FUNCTION TEST: COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM get_incidents_with_user_info() 
WHERE title LIKE 'COMMENT TEST%'
ORDER BY category;

-- 6. Test adding more comments to verify real-time updates
DO $$
DECLARE
    test_user_id UUID;
    crime_incident_id UUID;
    comment_id UUID;
BEGIN
    -- Get user and crime incident
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    SELECT id INTO crime_incident_id FROM incidents WHERE title LIKE 'COMMENT TEST%CRIME%' LIMIT 1;
    
    IF test_user_id IS NOT NULL AND crime_incident_id IS NOT NULL THEN
        -- Add one more comment to crime incident
        INSERT INTO comments (incident_id, user_id, content, is_anonymous)
        VALUES (crime_incident_id, test_user_id, 'Additional crime comment', false);
        
        -- Update the comment count
        UPDATE incidents 
        SET comments_count = comments_count + 1 
        WHERE id = crime_incident_id;
        
        RAISE NOTICE 'Added additional comment to crime incident';
    END IF;
END $$;

-- 7. Final verification
SELECT 'FINAL VERIFICATION' as test;
SELECT 
    'Total incidents' as metric,
    COUNT(*)::text as value 
FROM incidents
UNION ALL
SELECT 
    'Total comments' as metric,
    COUNT(*)::text as value 
FROM comments
UNION ALL
SELECT 
    'Test incidents' as metric,
    COUNT(*)::text as value 
FROM incidents 
WHERE title LIKE 'COMMENT TEST%'
UNION ALL
SELECT 
    'Test comments' as metric,
    COUNT(*)::text as value 
FROM comments c
JOIN incidents i ON c.incident_id = i.id
WHERE i.title LIKE 'COMMENT TEST%';

-- 8. Show sample data for mobile app testing
SELECT 'SAMPLE DATA FOR MOBILE APP' as test;
SELECT 
    id, 
    title, 
    category, 
    severity, 
    comments_count, 
    likes, 
    views,
    is_verified,
    created_at 
FROM get_incidents_with_user_info() 
WHERE title LIKE 'COMMENT TEST%'
ORDER BY created_at DESC;













