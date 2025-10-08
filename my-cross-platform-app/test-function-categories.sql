-- Test Function Categories
-- This will test if the get_incidents_with_user_info function handles all categories

-- 1. Check if function exists
SELECT 'FUNCTION EXISTS?' as test;
SELECT EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_name = 'get_incidents_with_user_info'
) as function_exists;

-- 2. Test function with different categories
SELECT 'FUNCTION TEST - ALL CATEGORIES' as test;
SELECT category, COUNT(*) as count 
FROM get_incidents_with_user_info() 
GROUP BY category 
ORDER BY category;

-- 3. Test function with specific categories
SELECT 'FUNCTION TEST - SPECIFIC CATEGORIES' as test;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM get_incidents_with_user_info() WHERE category = 'crime') 
        THEN '✅ Crime visible in function'
        ELSE '❌ Crime NOT visible in function'
    END as crime_test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM get_incidents_with_user_info() WHERE category = 'fire') 
        THEN '✅ Fire visible in function'
        ELSE '❌ Fire NOT visible in function'
    END as fire_test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM get_incidents_with_user_info() WHERE category = 'earthquake') 
        THEN '✅ Earthquake visible in function'
        ELSE '❌ Earthquake NOT visible in function'
    END as earthquake_test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM get_incidents_with_user_info() WHERE category = 'other') 
        THEN '✅ Other visible in function'
        ELSE '❌ Other NOT visible in function'
    END as other_test;

-- 4. Compare direct table query vs function
SELECT 'DIRECT TABLE QUERY' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
GROUP BY category 
ORDER BY category;

SELECT 'FUNCTION QUERY' as test;
SELECT category, COUNT(*) as count 
FROM get_incidents_with_user_info() 
GROUP BY category 
ORDER BY category;

-- 5. Test if function has any filtering
SELECT 'FUNCTION SAMPLE DATA' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Check if there are any RLS policies affecting categories
SELECT 'RLS POLICIES CHECK' as test;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'incidents';

-- 7. Test direct insertion to see if it's an insertion issue
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a crime incident directly
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
                'DIRECT INSERT TEST - CRIME',
                'Testing direct crime insertion',
                'crime'::incident_category,
                'medium'::incident_severity,
                'Test Location',
                'POINT(123.8854 10.3157)',
                false,
                false,
                false,
                0, 0, 0, 0,
                'open'::incident_status
            ) RETURNING id INTO incident_id;
            
            RAISE NOTICE 'SUCCESS: Direct crime insertion worked (ID: %)', incident_id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Direct crime insertion failed - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;





