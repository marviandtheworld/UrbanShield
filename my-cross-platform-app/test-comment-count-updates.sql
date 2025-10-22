-- Test Comment Count Updates
-- This will test that comment counts update correctly when comments are added

-- 1. Check current incidents and their comment counts
SELECT 'BEFORE TEST: INCIDENTS WITH COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check current comments
SELECT 'BEFORE TEST: COMMENTS COUNT' as test;
SELECT COUNT(*) as total_comments FROM comments;

-- 3. Add some test comments to existing incidents
DO $$
DECLARE
    test_user_id UUID;
    test_incident_id UUID;
    comment_id UUID;
    comment_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Get the first incident
        SELECT id INTO test_incident_id FROM incidents LIMIT 1;
        
        IF test_incident_id IS NOT NULL THEN
            -- Add 3 test comments to the first incident
            FOR i IN 1..3 LOOP
                BEGIN
                    INSERT INTO comments (
                        incident_id,
                        user_id,
                        content,
                        is_anonymous
                    ) VALUES (
                        test_incident_id,
                        test_user_id,
                        'Test comment ' || i || ' - This is a test comment to verify comment count updates',
                        false
                    ) RETURNING id INTO comment_id;
                    
                    comment_count := comment_count + 1;
                    RAISE NOTICE 'Added comment % for incident % (ID: %)', i, test_incident_id, comment_id;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Failed to add comment %: %', i, SQLERRM;
                END;
            END LOOP;
            
            RAISE NOTICE 'Added % comments to incident %', comment_count, test_incident_id;
        ELSE
            RAISE NOTICE 'No incidents found to add comments to';
        END IF;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 4. Check comment counts after adding comments
SELECT 'AFTER TEST: INCIDENTS WITH UPDATED COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check total comments
SELECT 'AFTER TEST: TOTAL COMMENTS' as test;
SELECT COUNT(*) as total_comments FROM comments;

-- 6. Test the function to see if it reflects the updated counts
SELECT 'FUNCTION TEST: COMMENT COUNTS' as test;
SELECT id, title, category, comments_count, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Verify comment count accuracy
SELECT 'COMMENT COUNT ACCURACY CHECK' as test;
SELECT 
    i.id,
    i.title,
    i.comments_count as incident_count,
    COUNT(c.id) as actual_comment_count,
    CASE 
        WHEN i.comments_count = COUNT(c.id) THEN '✅ Accurate'
        ELSE '❌ Mismatch'
    END as status
FROM incidents i
LEFT JOIN comments c ON i.id = c.incident_id
GROUP BY i.id, i.title, i.comments_count
ORDER BY i.created_at DESC 
LIMIT 5;

-- 8. Test adding more comments to verify real-time updates
DO $$
DECLARE
    test_user_id UUID;
    test_incident_id UUID;
    comment_id UUID;
BEGIN
    -- Get the first user ID and incident
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    SELECT id INTO test_incident_id FROM incidents LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_incident_id IS NOT NULL THEN
        -- Add one more comment
        INSERT INTO comments (
            incident_id,
            user_id,
            content,
            is_anonymous
        ) VALUES (
            test_incident_id,
            test_user_id,
            'Real-time test comment - This should update the count immediately',
            false
        ) RETURNING id INTO comment_id;
        
        RAISE NOTICE 'Added real-time test comment (ID: %)', comment_id;
    END IF;
END $$;

-- 9. Final verification
SELECT 'FINAL VERIFICATION: COMMENT COUNTS' as test;
SELECT 
    i.id,
    i.title,
    i.comments_count,
    COUNT(c.id) as actual_comments,
    CASE 
        WHEN i.comments_count = COUNT(c.id) THEN '✅ Count is accurate'
        ELSE '❌ Count mismatch - incident shows ' || i.comments_count || ' but has ' || COUNT(c.id) || ' comments'
    END as verification
FROM incidents i
LEFT JOIN comments c ON i.id = c.incident_id
GROUP BY i.id, i.title, i.comments_count
ORDER BY i.created_at DESC 
LIMIT 3;









