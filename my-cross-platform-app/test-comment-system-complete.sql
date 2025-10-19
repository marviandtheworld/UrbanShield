-- Test Complete Comment System
-- This will test the entire comment system including UI updates

-- 1. Check current state
SELECT 'BEFORE TEST: CURRENT STATE' as test;
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

-- 2. Create a test incident for comment testing
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Create a test incident
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
            'COMMENT UI TEST INCIDENT',
            'This incident is for testing comment UI updates',
            'other'::incident_category,
            'medium'::incident_severity,
            'Test Location',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0, 0, 0, 0,
            'open'::incident_status
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Created test incident (ID: %)', incident_id;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Add multiple comments to test the UI update
DO $$
DECLARE
    test_user_id UUID;
    test_incident_id UUID;
    comment_id UUID;
    i INTEGER;
BEGIN
    -- Get user and test incident
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    SELECT id INTO test_incident_id FROM incidents WHERE title = 'COMMENT UI TEST INCIDENT' LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_incident_id IS NOT NULL THEN
        -- Add 3 test comments
        FOR i IN 1..3 LOOP
            INSERT INTO comments (incident_id, user_id, content, is_anonymous)
            VALUES (test_incident_id, test_user_id, 'Test comment ' || i || ' for UI update testing', false)
            RETURNING id INTO comment_id;
            
            -- Update comment count
            UPDATE incidents 
            SET comments_count = i 
            WHERE id = test_incident_id;
            
            RAISE NOTICE 'Added comment % (ID: %), updated count to %', i, comment_id, i;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users or test incident found';
    END IF;
END $$;

-- 4. Check results after adding comments
SELECT 'AFTER TEST: INCIDENTS WITH COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM incidents 
WHERE title = 'COMMENT UI TEST INCIDENT';

-- 5. Verify comment count accuracy
SELECT 'COMMENT COUNT ACCURACY' as test;
SELECT 
    i.id,
    i.title,
    i.comments_count as stored_count,
    COUNT(c.id) as actual_comments,
    CASE 
        WHEN i.comments_count = COUNT(c.id) THEN '✅ Accurate'
        ELSE '❌ Mismatch - stored: ' || i.comments_count || ', actual: ' || COUNT(c.id)
    END as status
FROM incidents i
LEFT JOIN comments c ON i.id = c.incident_id
WHERE i.title = 'COMMENT UI TEST INCIDENT'
GROUP BY i.id, i.title, i.comments_count;

-- 6. Test function returns correct data
SELECT 'FUNCTION TEST: COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM get_incidents_with_user_info() 
WHERE title = 'COMMENT UI TEST INCIDENT';

-- 7. Show all incidents with their comment counts
SELECT 'ALL INCIDENTS WITH COMMENT COUNTS' as test;
SELECT 
    id, 
    title, 
    category, 
    comments_count, 
    likes, 
    views,
    created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Test adding one more comment to verify real-time updates
DO $$
DECLARE
    test_user_id UUID;
    test_incident_id UUID;
    comment_id UUID;
    current_count INTEGER;
    new_count INTEGER;
BEGIN
    -- Get user and test incident
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    SELECT id INTO test_incident_id FROM incidents WHERE title = 'COMMENT UI TEST INCIDENT' LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_incident_id IS NOT NULL THEN
        -- Get current count
        SELECT comments_count INTO current_count FROM incidents WHERE id = test_incident_id;
        new_count := current_count + 1;
        
        -- Add comment
        INSERT INTO comments (incident_id, user_id, content, is_anonymous)
        VALUES (test_incident_id, test_user_id, 'Real-time UI test comment', false)
        RETURNING id INTO comment_id;
        
        -- Update count
        UPDATE incidents 
        SET comments_count = new_count 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'Added real-time comment (ID: %), count: % -> %', comment_id, current_count, new_count;
    END IF;
END $$;

-- 9. Final verification
SELECT 'FINAL VERIFICATION' as test;
SELECT 
    'Test incident comments' as metric,
    comments_count::text as value 
FROM incidents 
WHERE title = 'COMMENT UI TEST INCIDENT'
UNION ALL
SELECT 
    'Total incidents' as metric,
    COUNT(*)::text as value 
FROM incidents
UNION ALL
SELECT 
    'Total comments' as metric,
    COUNT(*)::text as value 
FROM comments;













