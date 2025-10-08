-- Test Comment UI Update
-- This will test if comment counts are updating properly in the database

-- 1. Check current incidents and their comment counts
SELECT 'BEFORE TEST: INCIDENTS WITH COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check current comments
SELECT 'BEFORE TEST: COMMENTS' as test;
SELECT incident_id, COUNT(*) as comment_count 
FROM comments 
GROUP BY incident_id 
ORDER BY incident_id;

-- 3. Add a test comment to the first incident
DO $$
DECLARE
    test_user_id UUID;
    test_incident_id UUID;
    comment_id UUID;
    current_count INTEGER;
    new_count INTEGER;
BEGIN
    -- Get the first user and incident
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    SELECT id INTO test_incident_id FROM incidents LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_incident_id IS NOT NULL THEN
        -- Get current comment count
        SELECT comments_count INTO current_count FROM incidents WHERE id = test_incident_id;
        new_count := current_count + 1;
        
        RAISE NOTICE 'Adding comment to incident % (current count: %, new count: %)', 
            test_incident_id, current_count, new_count;
        
        -- Add comment
        INSERT INTO comments (incident_id, user_id, content, is_anonymous)
        VALUES (test_incident_id, test_user_id, 'UI Update Test Comment', false)
        RETURNING id INTO comment_id;
        
        -- Update comment count
        UPDATE incidents 
        SET comments_count = new_count 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'Comment added (ID: %), count updated to %', comment_id, new_count;
    ELSE
        RAISE NOTICE 'No users or incidents found';
    END IF;
END $$;

-- 4. Check results after adding comment
SELECT 'AFTER TEST: INCIDENTS WITH UPDATED COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verify comment count accuracy
SELECT 'COMMENT COUNT ACCURACY CHECK' as test;
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
GROUP BY i.id, i.title, i.comments_count
ORDER BY i.created_at DESC 
LIMIT 5;

-- 6. Test function returns correct data
SELECT 'FUNCTION TEST: COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Show sample data for mobile app
SELECT 'SAMPLE DATA FOR MOBILE APP' as test;
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
LIMIT 3;





