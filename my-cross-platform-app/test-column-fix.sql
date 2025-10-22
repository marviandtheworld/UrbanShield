-- Test Column Fix
-- This tests if the missing columns issue is resolved

-- 1. Check what columns exist
SELECT 
    'EXISTING COLUMNS' as info,
    column_name
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
AND column_name IN ('is_rescue', 'external_documents', 'shares_count', 'is_verified', 'flags', 'is_moderated', 'priority')
ORDER BY column_name;

-- 2. Test the function
SELECT 
    'FUNCTION TEST' as test,
    COUNT(*) as incident_count
FROM get_incidents_with_user_info();

-- 3. If function works, show sample data
SELECT 
    'SAMPLE DATA' as test,
    id,
    title,
    is_approved,
    is_verified,
    is_rescue,
    shares_count,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 3;










