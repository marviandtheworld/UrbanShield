-- Debug Comments Issue
-- This will help identify what's wrong with the comments system

-- 1. Check if comments table exists
SELECT 'COMMENTS TABLE EXISTS?' as test;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'comments'
) as comments_table_exists;

-- 2. Check if comments function exists
SELECT 'COMMENTS FUNCTION EXISTS?' as test;
SELECT EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_name = 'get_comments_with_user_info'
) as comments_function_exists;

-- 3. Check if there are any comments in the database
SELECT 'COMMENTS COUNT' as test;
SELECT COUNT(*) as total_comments FROM comments;

-- 4. Check if there are any incidents
SELECT 'INCIDENTS COUNT' as test;
SELECT COUNT(*) as total_incidents FROM incidents;

-- 5. Check if there are any users
SELECT 'USERS COUNT' as test;
SELECT COUNT(*) as total_users FROM profiles;

-- 6. Try to create a test comment if everything exists
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
        -- Try to insert a test comment
        BEGIN
            INSERT INTO comments (
                incident_id,
                user_id,
                content,
                is_anonymous
            ) VALUES (
                test_incident_id,
                test_user_id,
                'Test comment created at ' || NOW(),
                false
            ) RETURNING id INTO comment_id;
            
            RAISE NOTICE 'SUCCESS: Test comment created with ID: %', comment_id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Failed to create comment - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'ERROR: No incidents or users found';
    END IF;
END $$;

-- 7. Check comments after test
SELECT 'COMMENTS AFTER TEST' as test;
SELECT COUNT(*) as total_comments FROM comments;

-- 8. If comments table doesn't exist, show what needs to be created
SELECT 'MISSING TABLES/FUNCTIONS' as test;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') 
        THEN 'COMMENTS TABLE MISSING - Run create-comments-table.sql'
        ELSE 'Comments table exists'
    END as status;









