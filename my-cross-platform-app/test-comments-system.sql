-- Test Comments System
-- This will test the complete comments functionality

-- 1. First, run the create-comments-table.sql script to set up the comments table
-- 2. Then run this test to verify everything works

-- Check if comments table exists
SELECT 'COMMENTS TABLE CHECK' as test;
SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'comments';

-- Check if function exists
SELECT 'COMMENTS FUNCTION CHECK' as test;
SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_name = 'get_comments_with_user_info';

-- Get a test incident
SELECT 'TEST INCIDENT' as test;
SELECT id, title FROM incidents LIMIT 1;

-- Test inserting a comment
DO $$
DECLARE
    test_incident_id UUID;
    test_user_id UUID;
    comment_id UUID;
BEGIN
    -- Get the first incident and user
    SELECT id INTO test_incident_id FROM incidents LIMIT 1;
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_incident_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Insert a test comment
        INSERT INTO comments (
            incident_id,
            user_id,
            content,
            is_anonymous
        ) VALUES (
            test_incident_id,
            test_user_id,
            'This is a test comment to verify the comments system works properly!',
            false
        ) RETURNING id INTO comment_id;
        
        RAISE NOTICE 'SUCCESS: Comment inserted with ID: %', comment_id;
    ELSE
        RAISE NOTICE 'No incidents or users found for testing';
    END IF;
END $$;

-- Check comments count
SELECT 'COMMENTS COUNT' as test;
SELECT COUNT(*) as count FROM comments;

-- Test the function
SELECT 'FUNCTION TEST' as test;
SELECT id, content, user_name, username, created_at 
FROM get_comments_with_user_info(
    (SELECT id FROM incidents LIMIT 1)
);

-- Check if incidents comments_count was updated
SELECT 'INCIDENTS COMMENTS COUNT' as test;
SELECT id, title, comments_count 
FROM incidents 
WHERE id = (SELECT id FROM incidents LIMIT 1);









