-- Comprehensive Category Debug
-- This will identify exactly why only 'other' category works

-- 1. Check database schema
SELECT 'DATABASE SCHEMA CHECK' as test;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'incidents') 
        THEN '✅ Incidents table exists'
        ELSE '❌ Incidents table missing'
    END as incidents_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_category') 
        THEN '✅ incident_category enum exists'
        ELSE '❌ incident_category enum missing'
    END as category_enum,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_severity') 
        THEN '✅ incident_severity enum exists'
        ELSE '❌ incident_severity enum missing'
    END as severity_enum;

-- 2. Check enum values
SELECT 'ENUM VALUES CHECK' as test;
SELECT 'incident_category' as enum_type, enumlabel as value 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'incident_category')
ORDER BY enumsortorder;

-- 3. Check current incidents
SELECT 'CURRENT INCIDENTS' as test;
SELECT category, COUNT(*) as count, MAX(created_at) as latest 
FROM incidents 
GROUP BY category 
ORDER BY category;

-- 4. Test each category individually with detailed error reporting
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
    cat TEXT;
    success_count INTEGER := 0;
    fail_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing categories with user ID: %', test_user_id;
        
        FOREACH cat IN ARRAY categories LOOP
            BEGIN
                -- Try to insert the category
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
                    'COMPREHENSIVE TEST - ' || UPPER(cat),
                    'Testing ' || cat || ' category with comprehensive debug',
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
                
                RAISE NOTICE 'SUCCESS: % category inserted successfully (ID: %)', cat, incident_id;
                success_count := success_count + 1;
            EXCEPTION
                WHEN invalid_text_representation THEN
                    RAISE NOTICE 'ERROR: % is not a valid incident_category enum value', cat;
                    fail_count := fail_count + 1;
                WHEN foreign_key_violation THEN
                    RAISE NOTICE 'ERROR: % category failed due to foreign key violation - %', cat, SQLERRM;
                    fail_count := fail_count + 1;
                WHEN not_null_violation THEN
                    RAISE NOTICE 'ERROR: % category failed due to not null violation - %', cat, SQLERRM;
                    fail_count := fail_count + 1;
                WHEN check_violation THEN
                    RAISE NOTICE 'ERROR: % category failed due to check violation - %', cat, SQLERRM;
                    fail_count := fail_count + 1;
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERROR: % category failed with error: % (SQLSTATE: %)', cat, SQLERRM, SQLSTATE;
                    fail_count := fail_count + 1;
            END;
        END LOOP;
        
        RAISE NOTICE 'SUMMARY: % categories succeeded, % categories failed', success_count, fail_count;
    ELSE
        RAISE NOTICE 'ERROR: No users found in profiles table';
    END IF;
END $$;

-- 5. Check results after comprehensive test
SELECT 'RESULTS AFTER COMPREHENSIVE TEST' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
WHERE title LIKE 'COMPREHENSIVE TEST%'
GROUP BY category 
ORDER BY category;

-- 6. Test function visibility
SELECT 'FUNCTION VISIBILITY TEST' as test;
SELECT 
    'Direct table query' as source,
    category, 
    COUNT(*) as count 
FROM incidents 
WHERE title LIKE 'COMPREHENSIVE TEST%'
GROUP BY category 
UNION ALL
SELECT 
    'Function query' as source,
    category, 
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE title LIKE 'COMPREHENSIVE TEST%'
GROUP BY category
ORDER BY source, category;

-- 7. Check for any RLS policies that might be filtering categories
SELECT 'RLS POLICIES ANALYSIS' as test;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'incidents'
ORDER BY policyname;

-- 8. Final verification
SELECT 'FINAL VERIFICATION' as test;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents WHERE category = 'crime') > 0 
        THEN '✅ Crime category works'
        ELSE '❌ Crime category does not work'
    END as crime_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents WHERE category = 'fire') > 0 
        THEN '✅ Fire category works'
        ELSE '❌ Fire category does not work'
    END as fire_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents WHERE category = 'earthquake') > 0 
        THEN '✅ Earthquake category works'
        ELSE '❌ Earthquake category does not work'
    END as earthquake_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents WHERE category = 'other') > 0 
        THEN '✅ Other category works'
        ELSE '❌ Other category does not work'
    END as other_status;





