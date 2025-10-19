-- Debug Category Enum Issue
-- This will help identify why only 'other' category works

-- 1. Check if incident_category enum exists and what values it has
SELECT 'INCIDENT_CATEGORY ENUM VALUES' as test;
SELECT enumlabel as category_value 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'incident_category'
)
ORDER BY enumsortorder;

-- 2. Check if incident_severity enum exists and what values it has
SELECT 'INCIDENT_SEVERITY ENUM VALUES' as test;
SELECT enumlabel as severity_value 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'incident_severity'
)
ORDER BY enumsortorder;

-- 3. Check current incidents and their categories
SELECT 'CURRENT INCIDENTS BY CATEGORY' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
GROUP BY category 
ORDER BY category;

-- 4. Test inserting each category individually
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
    cat TEXT;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        FOREACH cat IN ARRAY categories LOOP
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
                    'DEBUG TEST - ' || UPPER(cat),
                    'Testing ' || cat || ' category insertion',
                    cat::incident_category,
                    'medium'::incident_severity,
                    'Test Location',
                    'POINT(123.8854 10.3157)',
                    false,
                    false,
                    false,
                    0, 0, 0, 0,
                    'open'
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'SUCCESS: % category inserted (ID: %)', cat, incident_id;
            EXCEPTION
                WHEN invalid_text_representation THEN
                    RAISE NOTICE 'ERROR: % is not a valid incident_category enum value', cat;
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERROR: % category failed - %', cat, SQLERRM;
            END;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 5. Check results after test
SELECT 'RESULTS AFTER CATEGORY TEST' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
WHERE title LIKE 'DEBUG TEST%'
GROUP BY category 
ORDER BY category;

-- 6. Check if there are any enum type issues
SELECT 'ENUM TYPE ISSUES' as test;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_category') 
        THEN 'incident_category enum exists'
        ELSE 'incident_category enum MISSING'
    END as category_enum_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_severity') 
        THEN 'incident_severity enum exists'
        ELSE 'incident_severity enum MISSING'
    END as severity_enum_status;













