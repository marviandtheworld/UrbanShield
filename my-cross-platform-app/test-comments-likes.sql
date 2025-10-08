-- Test Comments and Likes Functionality
-- This will test that the database can handle likes and comments updates

-- 1. Check current incidents
SELECT 'CURRENT INCIDENTS' as test;
SELECT id, title, likes_count, comments_count, views_count 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Test updating likes count
DO $$
DECLARE
    test_incident_id UUID;
BEGIN
    -- Get the first incident
    SELECT id INTO test_incident_id FROM incidents LIMIT 1;
    
    IF test_incident_id IS NOT NULL THEN
        -- Test updating likes_count
        UPDATE incidents 
        SET likes_count = COALESCE(likes_count, 0) + 1 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'SUCCESS: Updated likes_count for incident: %', test_incident_id;
        
        -- Test updating comments_count
        UPDATE incidents 
        SET comments_count = COALESCE(comments_count, 0) + 1 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'SUCCESS: Updated comments_count for incident: %', test_incident_id;
        
        -- Test updating views_count
        UPDATE incidents 
        SET views_count = COALESCE(views_count, 0) + 1 
        WHERE id = test_incident_id;
        
        RAISE NOTICE 'SUCCESS: Updated views_count for incident: %', test_incident_id;
    ELSE
        RAISE NOTICE 'No incidents found to test';
    END IF;
END $$;

-- 3. Check updated counts
SELECT 'UPDATED COUNTS' as test;
SELECT id, title, likes_count, comments_count, views_count 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Test function can see updated counts
SELECT 'FUNCTION CAN SEE UPDATED COUNTS' as test;
SELECT id, title, likes, comments_count, views 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 3;





