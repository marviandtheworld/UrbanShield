-- Test Complete News Feed Functionality
-- This will test category filtering, verification, and all features

-- 1. Check current state
SELECT 'BEFORE TEST: INCIDENTS COUNT' as test;
SELECT COUNT(*) as total_incidents FROM incidents;

-- 2. Check categories distribution
SELECT 'CATEGORIES DISTRIBUTION' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
GROUP BY category 
ORDER BY category;

-- 3. Check verification status
SELECT 'VERIFICATION STATUS' as test;
SELECT is_verified, COUNT(*) as count 
FROM incidents 
GROUP BY is_verified;

-- 4. Test function returns all data correctly
SELECT 'FUNCTION TEST - ALL DATA' as test;
SELECT COUNT(*) as total_from_function FROM get_incidents_with_user_info();

-- 5. Test category filtering
SELECT 'CATEGORY FILTERING TEST' as test;
SELECT 
    'All' as filter,
    COUNT(*) as count 
FROM get_incidents_with_user_info()
UNION ALL
SELECT 
    'Crime' as filter,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'crime'
UNION ALL
SELECT 
    'Fire' as filter,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'fire'
UNION ALL
SELECT 
    'Earthquake' as filter,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'earthquake'
UNION ALL
SELECT 
    'Other' as filter,
    COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE category = 'other';

-- 6. Show sample incidents with all details
SELECT 'SAMPLE INCIDENTS WITH DETAILS' as test;
SELECT 
    id, 
    title, 
    category, 
    severity, 
    is_verified, 
    is_urgent, 
    views, 
    likes, 
    comments_count,
    created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Test specific category filtering (like the app does)
SELECT 'CRIME INCIDENTS ONLY' as test;
SELECT id, title, category, severity, is_verified, created_at 
FROM get_incidents_with_user_info() 
WHERE category = 'crime'
ORDER BY created_at DESC;

SELECT 'FIRE INCIDENTS ONLY' as test;
SELECT id, title, category, severity, is_verified, created_at 
FROM get_incidents_with_user_info() 
WHERE category = 'fire'
ORDER BY created_at DESC;

SELECT 'EARTHQUAKE INCIDENTS ONLY' as test;
SELECT id, title, category, severity, is_verified, created_at 
FROM get_incidents_with_user_info() 
WHERE category = 'earthquake'
ORDER BY created_at DESC;

-- 8. Check if there are any data type issues
SELECT 'DATA TYPE CHECK' as test;
SELECT 
    'Category values' as check_type,
    array_agg(DISTINCT category) as values 
FROM get_incidents_with_user_info()
UNION ALL
SELECT 
    'Severity values' as check_type,
    array_agg(DISTINCT severity) as values 
FROM get_incidents_with_user_info()
UNION ALL
SELECT 
    'Verification values' as check_type,
    array_agg(DISTINCT is_verified::text) as values 
FROM get_incidents_with_user_info();

-- 9. Final summary
SELECT 'FINAL SUMMARY' as test;
SELECT 
    'Total incidents' as metric,
    COUNT(*)::text as value 
FROM get_incidents_with_user_info()
UNION ALL
SELECT 
    'Categories with incidents' as metric,
    COUNT(DISTINCT category)::text as value 
FROM get_incidents_with_user_info()
UNION ALL
SELECT 
    'Verified incidents' as metric,
    COUNT(*)::text as value 
FROM get_incidents_with_user_info() 
WHERE is_verified = true
UNION ALL
SELECT 
    'Urgent incidents' as metric,
    COUNT(*)::text as value 
FROM get_incidents_with_user_info() 
WHERE is_urgent = true;









