-- Test Category Filtering
-- This will test if incidents are properly categorized and can be filtered

-- 1. Check current incidents by category
SELECT 'CURRENT INCIDENTS BY CATEGORY' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
GROUP BY category 
ORDER BY category;

-- 2. Test the function returns all categories
SELECT 'FUNCTION RETURNS ALL CATEGORIES' as test;
SELECT category, COUNT(*) as count 
FROM get_incidents_with_user_info() 
GROUP BY category 
ORDER BY category;

-- 3. Test specific category filtering
SELECT 'CRIME INCIDENTS ONLY' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
WHERE category = 'crime'
ORDER BY created_at DESC;

SELECT 'FIRE INCIDENTS ONLY' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
WHERE category = 'fire'
ORDER BY created_at DESC;

SELECT 'EARTHQUAKE INCIDENTS ONLY' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
WHERE category = 'earthquake'
ORDER BY created_at DESC;

-- 4. Create test incidents with specific categories if needed
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'earthquake'];
    cat TEXT;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        FOREACH cat IN ARRAY categories LOOP
            -- Check if we already have incidents for this category
            IF NOT EXISTS (SELECT 1 FROM incidents WHERE category = cat::incident_category) THEN
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
                        'FILTER TEST - ' || UPPER(cat) || ' INCIDENT',
                        'Testing ' || cat || ' category filtering',
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
                    
                    RAISE NOTICE 'Created test incident for % category (ID: %)', cat, incident_id;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Failed to create test incident for %: %', cat, SQLERRM;
                END;
            ELSE
                RAISE NOTICE 'Test incident for % already exists', cat;
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 5. Final verification - show all incidents with their categories
SELECT 'FINAL VERIFICATION - ALL INCIDENTS' as test;
SELECT id, title, category, severity, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Test category filtering in the app
SELECT 'CATEGORY FILTERING TEST' as test;
SELECT 
    'All incidents' as filter_type,
    COUNT(*) as count 
FROM get_incidents_with_user_info()
UNION ALL
SELECT 
    'Crime only' as filter_type,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'crime'
UNION ALL
SELECT 
    'Fire only' as filter_type,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'fire'
UNION ALL
SELECT 
    'Earthquake only' as filter_type,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'earthquake'
UNION ALL
SELECT 
    'Other only' as filter_type,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'other';


